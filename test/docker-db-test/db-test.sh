bash kill-containers.sh

FD=false
FB=false
for var in "$@"
do
    if [ "$var" = "-fd" ]
        then FD=true
    fi

    if [ "$var" = "-fb" ]
    then FB=true
    fi
done

echo BUILDALL
IMAGES=$(docker images | grep seneca-db-test-harness)
if [ "$IMAGES" = "" -o "$FD" = true ]
    then
    echo PULLING FROM DOCKER SENECA-DB-TEST-HARNESS
    docker pull kamilmech/seneca-db-test-harness
else
    echo SENECA-DB-TEST-HARNESS FOUND
fi
nohup gnome-terminal --disable-factory -x bash -c "bash db-test-harness.sh" >/dev/null 2>&1 &
sleep 1

if [ "$FB" = true ]
    then
    cd ../..
    echo REBUILDING THE APP
    docker build --force-rm -t well-app .
    cd test/docker-db-test
fi
nohup gnome-terminal --disable-factory -x bash -c "bash app.sh" >/dev/null 2>&1 &

echo STANDBY BEFORE TEST
sleep 5
echo TESTING
npm test

read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
echo 
bash clean.sh