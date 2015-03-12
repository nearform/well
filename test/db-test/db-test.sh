
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
    declare -a DBS=("mem-store" "mongo-store" "jsonfile-store" "postgresql-store")
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
    fi
    nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/dbs/$SC $DB" >/dev/null 2>&1 &

    sleep 5

    if [ "$FB" = true ]
        then
        echo REBUILD THE APP
        cd ../..
        docker build --force-rm -t well-app .
        cd test/db-test/
        FB=false
    else
        echo NO NEED TO REBUILD THE APP
    fi

    echo RUN APP
    if [ "$TU" = false ]
        then nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/app.sh $DB" >/dev/null 2>&1 &
    fi

    echo STANDBY BEFORE TEST
    sleep 5
    echo TEST
    if [ "$TU" = true ]
        then  npm run unit-test --db=$DB
    elif [ "$TA" = true ]
        then npm run acceptance-test
    else
        npm test --db=$DB
    fi

    read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
    echo 
    bash $PREFIX/clean.sh -prompt

    SC=""
    IMG=""
done
