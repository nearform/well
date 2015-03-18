echo RUN POSTGRES

docker run --name postgresql-inst -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password postgres

read -p "DB IS DONE" -n 1 -s
echo 