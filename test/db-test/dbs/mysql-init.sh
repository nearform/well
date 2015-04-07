
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker run --rm --name mysql-inst -e MYSQL_DATABASE=admin -e MYSQL_ROOT_PASSWORD=password mysql --skip-name-resolve  &
sleep 1

echo
PORT=3306
HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
echo DB DOCKER HEX "$HEX"
IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
echo DB ADDR "$IP:$PORT"

export MYSQL_HOST=$IP
export MYSQL_TCP_PORT=$PORT
export MYSQL_PWD=password

bash $PREFIX/../util/wait-connect.sh $IP $PORT

echo ---
echo INIT START
mysql -u root -ppassword admin < $PREFIX/mysql.sql
echo INIT COMPLETE
echo ---
mysql -u root -ppassword admin

echo
read
echo 