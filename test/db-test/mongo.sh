echo RUN MONGO

cd ../..
docker run --rm -p 27017:27017 -p 28017:28017 --name mongo-inst mongo --httpinterface
sleep 1

read -p "DB IS DONE" -n 1 -s
echo 