
FD=false
FB=false
TU=false
TA=false
for VAR in "$@"
do
    if [ "$VAR" = "-fd" ]
        then FD=true
    fi

    if [ "$VAR" = "-fb" ]
        then FB=true
    fi

    if [ "$VAR" = "-tu" ]
        then TU=true
    fi

    if [ "$VAR" = "-ta" ]
        then TA=true
    fi
done

if [ "$1" = "" -o "$1" = "all" ]
    then
    declare -a DBS=("mem-store" "mongo-store" "jsonfile-store" "redis-store")
    declare -a IGNORED=("postgresql-store")
else
    declare -a DBS=("$1")
fi
PREFIX="./"


for DB in ${DBS[@]}
do
    echo 
    echo TESTING $DB DB
    bash $PREFIX/clean.sh

    echo BUILD DB

    if [ "$DB" = "mongo-store" ]
        then IMG="mongo"
    elif [ "$DB" = "postgresql-store" ]
        then IMG="postgres"
    elif [ "$DB" = "redis-store" ]
        then IMG="redis"
    fi

    if [ "$IMG" != "" ]
        then
        bash $PREFIX/image-check.sh $IMG $FD
    fi

    echo RUN DB
    if [ "$DB" = "mongo-store" ]
        then SC="mongo.sh"
    elif [ "$DB" = "postgresql-store" ]
        then SC="postgres.sh"
    elif [ "$DB" = "redis-store" ]
        then SC="redis.sh"
    fi

    nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/dbs/$SC $DB" >/dev/null 2>&1 &

    IMAGES=$(docker images | grep well-app)
    if [ "$FB" = true -o "$IMAGES" = "" ]
        then
        echo REBUILD THE APP
        cd ../..
        docker build --force-rm -t well-app .
        cd test/db-test/
        FB=false
    else
        echo NO NEED TO REBUILD THE APP
        sleep 6
    fi

    echo RUN APP
    if [ "$TU" = false ]
        then nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/app.sh $DB" >/dev/null 2>&1 &
    fi

    if [ "$DB" = "mongo-store" ]
        then PORT=27017
    elif [ "$DB" = "postgresql-store" ]
        then PORT=5432
    elif [ "$DB" = "redis-store" ]
        then PORT=6379
    else
        PORT=false
    fi

    if [ "$PORT" != false ]
        then
        echo PREPARE TEST FEED
        HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
        echo DB HEX "$HEX"
        IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
        echo DB ADDR "$IP:$PORT"
    else
        PORT=""
    fi

    echo STANDBY BEFORE TEST
    sleep 5
    echo TEST $DB DB
    nohup gnome-terminal --disable-factory -x bash -c "bash test.sh $DB $TU $TA $IP $PORT" >/dev/null 2>&1 &

    read -p "TAP ANY KEY TO STOP ALL AND CLEAN" -n 1 -s
    echo 
    bash $PREFIX/clean.sh -prompt

    SC=""
    IMG=""
done
