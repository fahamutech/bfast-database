docker build --tag build-db .
docker run --rm -v ~/bfast-database:/bfast build-db npm i
