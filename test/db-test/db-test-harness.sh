echo RUN DB-TEST-HARNESS

if [ "$2" == "local" ]
    then
    cd ../../node_modules/seneca-db-test-harness
    node seneca-db-test-harness.js --db="$1"
elif [ "$2" == "docker" ]
    then
    cd ../..
    docker run -v /home/deploy/meta:/meta --rm --name db-test-harness-inst -e db=$1 kamilmech/seneca-db-test-harness
fi

read -p "DB IS DONE" -n 1 -s
echo 