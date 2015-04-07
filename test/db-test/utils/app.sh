echo RUN APP
DB=$1

declare -a LINKLESS=("mem-store" "jsonfile-store")
LINK=true
for VAR in ${LINKLESS[@]}
do
    if [ "$VAR" = "$DB" ]; then LINK=false
    fi
done

BASE="docker run -p 3333:3333 --rm -e db=$DB"
if [ "$LINK" = false ]; then BASE="$BASE well-app"
else
    IFS='-' read -ra IN <<< "$DB"
    DBTRIM="${IN[0]}"
    BASE="$BASE --link $DBTRIM-inst:$DBTRIM-link well-app"
fi

echo "$BASE"
echo
bash -c "$BASE"

read -p "APP IS DONE" -n 1 -s
echo