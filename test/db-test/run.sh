# get workdir path
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo
echo WORKDIR $PREFIX

# read flags
FD=false
FB=false
TU=false
TA=false
NT=false
for VAR in "$@"
do
    if [ "$VAR" = "-fd" ]; then FD=true
    elif [ "$VAR" = "-fb" ]; then FB=true
    elif [ "$VAR" = "-tu" ]; then TU=true
    elif [ "$VAR" = "-ta" ]; then TA=true
    elif [ "$VAR" = "-nt" ]; then NT=true
    fi
done

# read db chosen
FCHAR="$(echo $1 | head -c 1)"
if [ "$1" = "" -o "$1" = "all" -o "$FCHAR" = "-" ]; then
    # defaults to this list
    declare -a DBS=("mem-store" "mongo-store" "jsonfile-store" "redis-store" "postgres-store" "mysql-store")
else
    # a single db can be directly specified, no constraints
    declare -a DBS=("$1")
fi
declare -a LINKLESS=("mem-store" "jsonfile-store")
declare -a IGNORED=()

# main body that iterates over all dbs
for DB in ${DBS[@]}
do
    bash $PREFIX/clean.sh

    LINKED=true
    for VAR in ${LINKLESS[@]}
    do
        if [ "$VAR" = "$DB" ]; then LINKED=false; fi
    done

    # ensuring docker image and running it
    echo 
    echo PREPARING $DB DB FOR TEST
    if [ "$LINKED" = true ]; then 
        echo USING DOCKER DB IMAGE FOR $DB
        IFS='-' read -ra IN <<< "$DB"
        DBTRIM="${IN[0]}"
        bash $PREFIX/utils/image-check.sh $DBTRIM $FD

        echo RUN DB
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/docker-db.sh $DB" >/dev/null 2>&1 &
    else
        echo USING SENECA DB TEST HARNESS FOR $DB
    fi

    # config port
    if [ "$DB" = "mongo-store" ]; then DB_PORT=27017
    elif [ "$DB" = "postgres-store" ]; then DB_PORT=5432
    elif [ "$DB" = "redis-store" ]; then DB_PORT=6379
    elif [ "$DB" = "mysql-store" ]; then DB_PORT=3306
    else DB_PORT=""
    fi

    if [ "$DB_PORT" != "" ]; then
        bash $PREFIX/utils/docker-inspect.sh DB $DB_PORT
        DB_HEX=$(bash $PREFIX/utils/read-inspect.sh hex)
        DB_IP=$(bash $PREFIX/utils/read-inspect.sh ip)
    fi

    # running app, rebuild is optional
    if [ "$TU" = false ]; then
        IMAGES=$(docker images | grep well-app)
        if [ "$FB" = true -o "$IMAGES" = "" ]; then
            echo REBUILD THE APP
            cd $PREFIX/../..
            docker build --force-rm -t well-app .
            cd test/db-test/
            FB=false
        else
            echo NO NEED TO REBUILD THE APP
        fi

        if [ "$LINKED" = true ]; then bash $PREFIX/utils/wait-connect.sh $DB_IP $DB_PORT; fi

        echo RUN APP
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/app.sh $DB" >/dev/null 2>&1 &
        APP_PORT="3333"

        bash $PREFIX/utils/docker-inspect.sh APP $APP_PORT
        APP_HEX=$(bash $PREFIX/utils/read-inspect.sh hex)
        APP_IP=$(bash $PREFIX/utils/read-inspect.sh ip)
    else
        echo NO NEED TO RUN THE APP FOR UNIT TEST
    fi

    #  run test
    if [ "$NT" = false ]; then
        if [ "$TU" = false ]; then bash $PREFIX/utils/wait-connect.sh $APP_IP $APP_PORT; fi
        if [ "$TU" = true ]; then bash $PREFIX/utils/wait-connect.sh $DB_IP $DB_PORT; fi

        echo
        echo TEST $DB DB
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/test.sh $DB $TU $TA $DB_IP $DB_PORT" >/dev/null 2>&1 &
    fi

    # prepare for next
    echo
    echo "TAP [ANY] KEY TO"
    read -p "STOP ALL AND CLEAN BEFORE NEXT" -n 1 -s
    echo 
    bash $PREFIX/clean.sh -prompt
done
