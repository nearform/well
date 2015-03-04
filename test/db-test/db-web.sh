echo RUN DB-WEB
cd ../..
docker run -v /home/deploy/meta:/meta --rm --name db-web-inst kamilmech/seneca-db-web