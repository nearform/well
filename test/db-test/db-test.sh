
FD=false
FB=false
for VAR in "$@"
do
    if [ "$VAR" = "-fd" ]
        then FD=true
    fi

    if [ "$VAR" = "-fb" ]
        then FB=true
    fi
done

if [ "$1" = "" -o "$1" = "all" ]
    then
    declare -a DBS=("mem-store" "mongo-store" "jsonfile-store")
else
    declare -a DBS=("$1")
fi
PREFIX="./"


for DB in ${DBS[@]}
do
    echo TESTING $DB DB
    bash $PREFIX/kill-containers.sh

    echo BUILD DB

    if [ "$DB" = "mongo-store" ]
        then IMG="mongo"
    fi
    if [ "$IMG" != "" ]
        then
        bash $PREFIX/image-check.sh $IMG $FD
    fi

    echo RUN DB
    if [ "$DB" = "mongo-store" ]
        then SC="mongo.sh"
    fi
    nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/$SC $DB" >/dev/null 2>&1 &

    sleep 1

    if [ "$FB" = true ]
        then
        echo REBUILD THE APP
        docker build --force-rm -t well-app .
        FB=false
    else
        echo NO NEED TO REBUILD THE APP
    fi

    echo RUN APP
    nohup gnome-terminal --disable-factory -x bash -c "bash $PREFIX/app.sh $DB" >/dev/null 2>&1 &

    echo STANDBY BEFORE TEST
    sleep 5
    echo TEST
    npm test --db=$DB

    read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
    echo 
    bash $PREFIX/clean.sh

    SC=""
    IMG=""
done
