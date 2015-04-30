#!/bin/bash
trap 'kill $$' SIGINT

echo IMAGE CHECK
IMG=$1
FD=$2

IMAGES=$(docker images | grep $IMG)
if [[ "$IMAGES" = "" || "$FD" = true ]]; then
    echo PULLING FROM DOCKER $IMG
    docker pull $IMG
else
    echo $IMG FOUND
fi