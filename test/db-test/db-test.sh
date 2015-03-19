
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo
echo WORKDIR $PREFIX

FD=false
FB=false
TU=false
TA=false
for VAR in "$@"
do
    if [ "$VAR" = "-fd" ]; then FD=true
    elif [ "$VAR" = "-fb" ]; then FB=true
    elif [ "$VAR" = "-tu" ]; then TU=true
    elif [ "$VAR" = "-ta" ]; then TA=true
    fi
done

FCHAR="$(echo $1 | head -c 1)"

if [ "$1" = "" -o "$1" = "all" -o "$FCHAR" = "-" ]; then
    declare -a DBS=("mem-store" "mongo-store" "jsonfile-store" "redis-store")
else
    declare -a DBS=("$1")
fi
declare -a LINKLESS=("mem-store" "jsonfile-store")
declare -a IGNORED=("postgres-store")

for DB in ${DBS[@]}
do
    bash $PREFIX/clean.sh

    VALID=true
    for VAR in ${LINKLESS[@]}
    do
        if [ "$VAR" = "$DB" ]; then VALID=false
        fi
    done

    echo 
    echo PREPARING $DB DB FOR TEST
    if [ "$VALID" = true ]; then 
        echo USING DOCKER DB IMAGE FOR $DB
        IFS='-' read -ra IN <<< "$DB"
        DBTRIM="${IN[0]}"
        echo DB $DB
        echo DBTRIM $DBTRIM
        echo FD $FD
        bash $PREFIX/image-check.sh $DBTRIM $FD

        echo RUN DB
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/docker-db.sh $DB" >/dev/null 2>&1 &
        sleep 6
    else
        echo USING SENECA DB TEST HARNESS FOR $DB
    fi

    echo
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

        echo RUN APP
        nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/app.sh $DB" >/dev/null 2>&1 &
        sleep 3
    else
        echo NO NEED TO RUN THE APP FOR UNIT TEST
    fi

    if [ "$DB" = "mongo-store" ]; then PORT=27017
    elif [ "$DB" = "postgres-store" ]; then PORT=5432
    elif [ "$DB" = "redis-store" ]; then PORT=6379
    else PORT=false
    fi

    if [ "$PORT" != false ]; then
        echo
        echo PREPARE TEST FEED
        HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
        echo DB DOCKER HEX "$HEX"
        IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
        echo DB ADDR "$IP:$PORT"
    else
        PORT=""
    fi

    echo
    echo TEST $DB DB
    nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/test.sh $DB $TU $TA $IP $PORT" >/dev/null 2>&1 &

    echo
    echo "TAP [ANY] KEY TO"
    read -p "STOP ALL AND CLEAN BEFORE NEXT" -n 1 -s
    echo 
    bash $PREFIX/clean.sh -prompt

    SC=""
    IMG=""
done
