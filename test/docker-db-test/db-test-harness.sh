echo RUN DB-TEST-HARNESS
cd ../..
docker run -v /home/deploy/meta:/meta --rm --name db-test-harness-inst -e db=jsonfile-store kamilmech/seneca-db-test-harness