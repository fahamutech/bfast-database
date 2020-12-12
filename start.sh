export APPLICATION_ID="bfast"
export MASTER_KEY="bfast"
export PROJECT_ID="bfast"
export MONGO_URL="mongodb://localhost/bfast"
export PORT="3000"
export PRODUCTION="1"
export S3_BUCKET=
export S3_ACCESS_KEY=
export S3_SECRET_KEY=
export S3_ENDPOINT=

npx bfast functions  serve --static --mongodb-url="${MONGO_URL}"
