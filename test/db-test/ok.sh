CONNECTED=""
while [ "$CONNECTED" = "" ]; do
    CONNECTED=$(nc -z -v $1 $2 2>&1)
    CONNECTED=$(echo $CONNECTED | grep "succ")
    printf '.'
done

echo
read -p "WAIT" -n 1 -s
echo 