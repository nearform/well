echo RUN APP

if [ "$1" = "mongo-store" ]
    then docker run -v /home/deploy/test:/test -p 3333:3333 -e db=$1 --link mongo-inst:mongo-link well-app
elif [ "$1" = "postgresql-store" ]
    then docker run -v /home/deploy/test:/test -p 3333:3333 -e db=$1 --link postgresql-inst:postgres-link well-app
else
    docker run -v /home/deploy/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --rm -e db=$1 well-app
fi

read -p "APP IS DONE" -n 1 -s
echo