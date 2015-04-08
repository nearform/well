#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

WORKDIR=$(bash $PREFIX/../util/conf-obtain.sh app workdir)
USER=$(bash $PREFIX/../util/conf-obtain.sh mysql user)
PASSWORD=$(bash $PREFIX/../util/conf-obtain.sh mysql password)
NAME=$(bash $PREFIX/../util/conf-obtain.sh mysql name)
SCHEMA=$(bash $PREFIX/../util/conf-obtain.sh mysql schema)
echo WORKDIR:$WORKDIR
echo USER:$USER
echo PASSWORD:$PASSWORD
echo NAME:$NAME
echo SCHEMA:$SCHEMA

docker run --rm --name mysql-inst -e MYSQL_DATABASE=$NAME -e MYSQL_ROOT_PASSWORD=$PASSWORD mysql --skip-name-resolve  &
sleep 1

PORT=3306
bash $PREFIX/../util/docker-inspect.sh "mysql DB" $PORT
HEX=$(bash $PREFIX/../util/read-inspect.sh hex)
IP=$(bash $PREFIX/../util/read-inspect.sh ip)

export MYSQL_HOST=$IP
export MYSQL_TCP_PORT=$PORT
export MYSQL_PWD=$PASSWORD

bash $PREFIX/../util/wait-connect.sh $IP $PORT

echo ---
echo INIT START
mysql -u $USER -p$PASSWORD $NAME < $WORKDIR$SCHEMA
echo INIT COMPLETE
echo ---
mysql -u $USER -p$PASSWORD $NAME

echo
read
echo 