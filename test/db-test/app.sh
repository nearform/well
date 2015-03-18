echo RUN APP

IFS='-' read -ra IN <<< "$1"
DB="${IN[0]}"

if [ "$1" = "mem-store" -o "$1" = "jsonfile-store" ]
    then docker run -v /home/deploy/test:/test -p 3333:3333 --rm -e db=$1 well-app
else
    docker run -v /home/deploy/test:/test -p 3333:3333 --rm -e db=$1 --link $DB-inst:$DB-link well-app
fi

read -p "APP IS DONE" -n 1 -s
echo