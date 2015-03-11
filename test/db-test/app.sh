echo RUN APP

if [ "$1" = "mongo-store" ]
    then docker run -v /home/deploy/test:/test -p 3333:3333 --link mongo-inst:mongo-link well-app
else
    docker run -v /home/deploy/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --rm -e db=$1 well-app
fi

read -p "APP IS DONE" -n 1 -s
echo