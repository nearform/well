echo RUN APP
DB=$1

declare -a LINKLESS=("mem" "jsonfile")
LINK=true
for VAR in ${LINKLESS[@]}
do
    if [ "$VAR" = "$DB" ]; then LINK=false
    fi
done

BASE="docker run -p 3333:3333 --rm -e db=$DB-store"
if [ "$LINK" = false ]; then BASE="$BASE well-app"
else
    BASE="$BASE --link $DB-inst:$DB-link well-app"
fi

echo "$BASE"
echo
bash -c "$BASE"

echo "APP IS DONE"
read
echo 