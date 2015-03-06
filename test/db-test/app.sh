echo RUN APP
cd ../..

if [ "$2" == "local" ]
    then
    node app.js --env=development --db="$1"
elif [ "$2" == "docker" ]
    then
    docker run -v /home/deploy/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --rm --link db-test-harness-inst:db-test-harness -e db=$1 well-app
fi

read -p "APP IS DONE" -n 1 -s
echo 