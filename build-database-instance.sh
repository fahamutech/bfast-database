docker build --tag build-db .
docker run --rm -v "${PWD}":/bfast build-db npm install
npm pack
npm publish
