echo RUN APP
cd ../..
docker run -v /home/deploy/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --rm --link db-test-harness-inst:db-test-harness well-app