#!/bin/bash
trap 'kill $$' SIGINT

echo KILLING CONTAINERS
CONTAINERS=$(docker ps -a -q)
if [[ "$CONTAINERS" = "" ]]; then
    echo NOTHING TO KILL
else
    docker kill $(docker ps -a -q)

    CONTAINERS=$(docker ps -a -q)
    if [[ "$CONTAINERS" = "" ]];  then echo
    else docker rm $(docker ps -a -q)
    fi
fi