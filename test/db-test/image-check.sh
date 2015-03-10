echo IMAGE CHECK
IMAGES=$(docker images | grep $1)
if [ "$IMAGES" = "" -o "$2" = true ]
    then
    echo PULLING FROM DOCKER $1
    docker pull $1
else
    echo $1 FOUND
fi