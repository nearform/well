
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

for DB in ${DBS[@]}
do
    bash kill-containers.sh

    echo BUILD DB

    if [ "$DB" = "mongo-store" ]
        then IMG="mongo"
    else
        IMG="kamilmech/seneca-db-test-harness"
    fi
    bash image-check.sh $IMG $FD
    FD=false

    echo RUN DB
    if [ "$DB" = "mongo-store" ]
        then SC="mongo.sh"
    else
        SC="harness.sh"
    fi
    nohup gnome-terminal --disable-factory -x bash -c "bash $SC $DB" >/dev/null 2>&1 &
    sleep 1

    if [ "$FB" = true ]
        echo REBUILD THE APP
        then
        cd ../..
        echo REBUILD THE APP
        docker build --force-rm -t well-app .
        FB=false
        cd test/db-test
    else
        echo NO NEED TO REBUILD THE APP
    fi

    echo RUN APP
    nohup gnome-terminal --disable-factory -x bash -c "bash app.sh $DB" >/dev/null 2>&1 &

    echo STANDBY BEFORE TEST
    sleep 5
    echo TEST
    npm test --db=$DB

    read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
    echo 
    bash clean.sh
done