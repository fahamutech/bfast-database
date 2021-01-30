docker build --tag build-db .
docker run --rm -v "${PWD}":/bfast build-db npm install
npm config set //registry.npmjs.org/:_authToken="${NPM_TOKEN}"
npm publish
