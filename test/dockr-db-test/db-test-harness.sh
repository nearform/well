echo RUN DB-TEST-HARNESS
cd ../..
docker run -v /home/deploy/meta:/meta --rm --name db-test-harness-inst kamilmech/seneca-db-test-harness