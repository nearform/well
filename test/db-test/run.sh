#!/bin/bash
trap 'kill $$' SIGINT

# get workdir path
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo
echo WORKDIR $PREFIX

ARGS=$@
if [[ "$ARGS" = "" ]]; then ARGS=$npm_config_args; fi
IFS=' ' read -ra ARGS <<< "$ARGS"

# read flags
FD=false
FB=false
TU=false
TA=false
NT=false
declare -a DBS=""
POPULATING=false
for VAR in "${ARGS[@]}"
do
    FCHAR="$(echo $VAR | head -c 1)"
    if [[ "$FCHAR" = "-" ]]; then POPULATING=false; fi
    
    if [[ "$VAR" = "-fd" ]]; then FD=true;
    elif [[ "$VAR" = "-fb" ]]; then FB=true;
    elif [[ "$VAR" = "-tu" ]]; then TU=true;
    elif [[ "$VAR" = "-ta" ]]; then TA=true;
    elif [[ "$VAR" = "-nt" ]]; then NT=true;
    # dbs can be directly specified, no constraints
    # it is also safe to not make any dash prefix validations thanks to elif
    elif [[ "$VAR" = "-dbs" ]]; then POPULATING=true
    elif [[ "$POPULATING" = true ]]; then
      IFS='-' read -ra IN <<< "$VAR"
      DBTRIM="${IN[0]}"
      IFS='x' read -ra IN <<< "${IN[1]}"
      TIMES=${IN[0]}
      if [[ "$TIMES" = "" ]]; then TIMES=1; fi
      while [[ $TIMES != 0 ]]
      do
        ((TIMES--))
        DBS+=($DBTRIM)
      done
    fi
done

# read db chosen
if [[ "${DBS[@]}" = "" ]]; then
    # defaults to this list
    declare -a DBS=("mem" "mongo" "jsonfile" "redis" "postgres" "mysql")
fi
declare -a LINKLESS=("mem" "jsonfile")
declare -a IGNORED=()

# generate conf
node $PREFIX/util/conf.js

# main body that iterates over all dbs
for DB in ${DBS[@]}
do
    bash $PREFIX/clean.sh

    LINKED=true
    for VAR in ${LINKLESS[@]}
    do
        if [[ "$VAR" = "$DB" ]]; then LINKED=false; fi
    done

    # ensuring docker image and running it
    echo 
    echo PREPARING $DB DB FOR TEST
    if [[ "$LINKED" = true ]]; then 
        echo USING DOCKER DB IMAGE FOR $DB
        bash $PREFIX/util/image-check.sh $DB $FD

        echo RUN DB
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/util/docker-db.sh $DB" >/dev/null 2>&1 &
    else
        echo USING SENECA DB TEST HARNESS FOR $DB
    fi

    # config port
    if [[ "$DB" = "mongo" ]]; then DB_PORT=27017
    elif [[ "$DB" = "postgres" ]]; then DB_PORT=5432
    elif [[ "$DB" = "redis" ]]; then DB_PORT=6379
    elif [[ "$DB" = "mysql" ]]; then DB_PORT=3306
    else DB_PORT=""
    fi

    if [[ "$DB_PORT" != "" ]]; then
        bash $PREFIX/util/docker-inspect.sh "$DB DB" $DB_PORT
        DB_HEX=$(bash $PREFIX/util/read-inspect.sh hex)
        DB_IP=$(bash $PREFIX/util/read-inspect.sh ip)
    fi

    # running app, rebuild is optional
    if [[ "$TU" = false ]]; then
        IMAGES=$(docker images | grep well-app)
        if [[ "$FB" = true || "$IMAGES" = "" ]]; then
            echo REBUILD THE APP
            cd $PREFIX/../..
            docker build --force-rm -t well-app .
            cd test/db-test/
            FB=false
        else
            echo NO NEED TO REBUILD THE APP
        fi

        if [[ "$LINKED" = true ]]; then bash $PREFIX/util/wait-connect.sh $DB_IP $DB_PORT; fi

        echo RUN APP
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/util/app.sh $DB" >/dev/null 2>&1 &
        APP_PORT="3333"

        bash $PREFIX/util/docker-inspect.sh APP $APP_PORT
        APP_HEX=$(bash $PREFIX/util/read-inspect.sh hex)
        APP_IP=$(bash $PREFIX/util/read-inspect.sh ip)
    else
        echo NO NEED TO RUN THE APP FOR UNIT TEST
    fi

    #  run test
    if [[ "$NT" = false ]]; then
        if [[ "$TU" = false ]]; then bash $PREFIX/util/wait-connect.sh $APP_IP $APP_PORT
        elif [[ "$TU" = true && "$LINKED" = true ]]; then bash $PREFIX/util/wait-connect.sh $DB_IP $DB_PORT; fi

        echo
        echo TEST $DB DB
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/util/test.sh $DB $TU $TA $DB_IP $DB_PORT" >/dev/null 2>&1 &
    fi

    # prepare for next
    echo
    echo "TAP [ENTER] KEY TO"
    echo "STOP ALL AND CLEAN BEFORE NEXT"
    read
    echo 
    bash $PREFIX/clean.sh -prompt
echo
done

# erasing temp files
TEMP=$(bash $PREFIX/util/read-inspect.sh conf)
