
docker volume create --name mongo_data
docker run -d \
    -p 27017:27017 \
    --name mongodb \
    -v mongo_data:/data/db \
    mongo:latest