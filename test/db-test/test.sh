DB=$1
TU=$2
TA=$3

if [ "$TU" = true ]
    then npm run unit-test --db=$DB
elif [ "$TA" = true ]
    then npm run acceptance-test
else
    npm test --db=$DB
fi

read -p "TEST IS DONE" -n 1 -s
echo 