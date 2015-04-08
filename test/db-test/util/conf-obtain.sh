#!/bin/bash
trap 'kill $$' SIGINT

PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DB=$1
QUERY=$2

FILE=$(bash $PREFIX/read-inspect.sh -nk conf)

for DB_FIELD in ${FILE[@]}
do
  if [[ "$DB_FIELD" = "$DB" ]]; then SEARCH=true
  elif [[ "$SEARCH" = true && "$OUT" != true && "$DB_FIELD" = "$QUERY" ]]; then OUT=true
  elif [[ "$OUT" = true ]]; then
    echo "$DB_FIELD"
    break
  elif [[ "$DB_FIELD" = "!" && "$SEARCH" = true ]]; then break
  fi
done