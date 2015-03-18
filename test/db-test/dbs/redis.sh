echo RUN REDIS

docker run --name redis-inst redis

read -p "DB IS DONE" -n 1 -s
echo 