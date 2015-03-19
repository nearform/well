
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DB=$1
TU=$2
TA=$3
IP=$4
PORT=$5

cd $PREFIX/../..
if [ "$TU" = true ]; then
    npm run unit-test --db=$DB --ip=$IP --port=$PORT
elif [ "$TA" = true ]; then
    npm run acceptance-test
else
    npm test --db=$DB --ip=$IP --port=$PORT
fi

read -p "TEST IS DONE" -n 1 -s
echo 