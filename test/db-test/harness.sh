echo RUN DB-TEST-HARNESS

cd ../..
docker run -v /home/deploy/meta:/meta --rm --name db-test-harness-inst -e db=$1 kamilmech/seneca-db-test-harness

read -p "DB IS DONE" -n 1 -s
echo 