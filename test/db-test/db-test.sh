
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

declare -a DBS=("jsonfile-store" "mem-store" "mongo-store")
DB=${DBS[0]}

if [ "$1" == "local" ]
    then
    bash kill-servers.sh
    nohup gnome-terminal --disable-factory -x bash -c "bash db-test-harness.sh $DB $1" >/dev/null 2>&1 &
    sleep 1
    nohup gnome-terminal --disable-factory -x bash -c "bash app.sh $DB $1" >/dev/null 2>&1 &
elif [ "$1" == "docker" ]
    then
    bash kill-containers.sh
    echo BUILDALL
    IMAGES=$(docker images | grep seneca-db-test-harness)
    if [ "$IMAGES" = "" -o "$FD" = true ]
        then
        echo PULLING FROM DOCKER SENECA-DB-TEST-HARNESS
        docker pull kamilmech/seneca-db-test-harness
    else
        echo SENECA-DB-TEST-HARNESS FOUND
    fi
    nohup gnome-terminal --disable-factory -x bash -c "bash db-test-harness.sh $DB $1" >/dev/null 2>&1 &
    sleep 1

    if [ "$FB" = true ]
        then
        cd ../..
        echo REBUILDING THE APP
        docker build --force-rm -t well-app .
        cd test/db-test
    fi
    nohup gnome-terminal --disable-factory -x bash -c "bash app.sh $DB $1" >/dev/null 2>&1 &
fi

echo STANDBY BEFORE TEST
sleep 5
echo TESTING
npm test

read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
echo 
bash clean.sh $1
