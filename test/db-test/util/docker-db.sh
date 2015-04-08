#!/bin/bash

PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB=$1

echo RUN $DB

BASE="docker run --rm"

if [[ "$DB" = "mongo" ]]; then
    BASE="$BASE -p 27017:27017 -p 28017:28017"
    ARGS="--httpinterface"
elif [[ "$DB" = "postgres" ]]; then
    BASE="bash $PREFIX/../dbs/postgres-init.sh"
elif [[ "$DB" = "mysql" ]]; then
    BASE="bash $PREFIX/../dbs/mysql-init.sh"
fi

BASE="$BASE --name $DB-inst $DB $ARGS"
echo "$BASE"
echo
bash -c "$BASE"

echo "DB IS DONE"
read
echo 