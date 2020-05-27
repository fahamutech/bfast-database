export PARSE_SERVER_APPLICATION_ID=daas
export PARSE_SERVER_MASTER_KEY=daas
export PARSE_SERVER_DATABASE_URI=mongodb://localhost:27017/smartstock
export PARSE_SERVER_START_LIVE_QUERY_SERVER=1
export PARSE_SERVER_LIVE_QUERY="{\"classNames\":[],redisURL: 'redis://rdb:6379'}"
export PARSE_SERVER_MAX_UPLOAD_SIZE=1048576mb
export PARSE_SERVER_OBJECT_ID_SIZE=16
export PARSE_SERVER_SCHEMA_CACHE_TTL=10000
export PORT=3000
export PARSE_SERVER_MOUNT_PATH=/daas
export S3_BUCKET=daas
export S3_ACCESS_KEY=5IGXSX5CU52C2RFZFALG
export S3_SECRET_KEY=2q2vteO9lQp6LaxT3lGMLdkUF5THdxZWmyWmb1y9
export S3_ENDPOINT=https://eu-central-1.linodeobjects.com/
# node dist/index.js
sudo docker run --name daas --rm joshuamshana/bfast-ce-daas:v2.0.0-beta.3
