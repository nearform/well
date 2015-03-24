echo
PORT=3306
HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
echo DB DOCKER HEX "$HEX"
IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
echo DB ADDR "$IP:$PORT"

export MYSQL_HOST=$IP
export MYSQL_TCP_PORT=$PORT
export MYSQL_USER=admin
export MYSQL_PWD=password

echo PINGING
until $(curl --output /dev/null --silent --head --fail $IP:$PORT); do
    printf '.'
    sleep 0.5
done

echo ---
echo INIT db: admin, user: admin, password: password
echo ---

echo
read -p "" -n 1 -s
echo 