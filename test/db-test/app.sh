echo RUN APP
cd ../..
docker run -v /home/deploy/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --rm --link db-web-inst:db-web well-app