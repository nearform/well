
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker run --rm --name postgres-inst -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password postgres &
sleep 1

echo
PORT=5432
HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
echo DB DOCKER HEX "$HEX"
IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
echo DB ADDR "$IP:$PORT"

bash $PREFIX/../utils/wait-connect.sh $IP $PORT

export PGHOST=$IP
export PGUSER=admin
export PGPASSWORD=password
export PGDATABASE=admin

echo ---
echo INIT db: admin, user: admin, password: password
psql -U admin -d admin -f $PREFIX/postgres.sql
echo USE [CTRL]+[D] to leave
psql -U admin -d admin
echo ---

echo
read -p "" -n 1 -s
echo 