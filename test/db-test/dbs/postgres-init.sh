#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

WORKDIR=$(bash $PREFIX/../util/conf-obtain.sh app workdir)
USER=$(bash $PREFIX/../util/conf-obtain.sh postgres username)
PASSWORD=$(bash $PREFIX/../util/conf-obtain.sh postgres password)
SCHEMA=$(bash $PREFIX/../util/conf-obtain.sh postgres schema)
echo WORKDIR:$WORKDIR
echo USER:$USER
echo PASSWORD:$PASSWORD
echo SCHEMA:$SCHEMA

docker run --rm --name postgres-inst -e POSTGRES_USER=$USER -e POSTGRES_USER=$USER -e POSTGRES_PASSWORD=$PASSWORD postgres &
sleep 1

PORT=5432
bash $PREFIX/../util/docker-inspect.sh "postgres DB" $PORT
HEX=$(bash $PREFIX/../util/read-inspect.sh hex)
IP=$(bash $PREFIX/../util/read-inspect.sh ip)

bash $PREFIX/../util/wait-connect.sh $IP $PORT

export PGHOST=$IP
export PGUSER=$USER
export PGPASSWORD=$PASSWORD

echo ---
echo INIT db: $USER, user: $USER, password: $PASSWORD
psql -U $USER -d $USER -f $WORKDIR$SCHEMA
echo USE [CTRL]+[D] to leave
psql -U $USER -d $USER
echo ---

echo
read
echo 