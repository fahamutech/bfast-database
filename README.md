# bfast-database

NodeJS Database Runtime Instance For Bfast::Cloud::Database.

## Get Started [ For Linux ]

This instruction tested for linux environment you can translate the commands to your OS.

* You need to have `NodeJs` to your local machine, or you can download from
  [NodeJs](https://nodejs.org/en/download/) website.

* You need to have mongodb in your local machine or mongodb url. To install mongodb go
  to [mongodb installation](https://docs.mongodb.com/manual/installation/)

### Install BFast Tools

To run this database instance you must have [bfast-tools](https://www.npmjs.com/package/bfast-tools)
package in your local

computer to install run `$ sudo npm install -g bfast-tools`

### Pull tarball file of bfast-database from npm

Open your terminal into a folder you want to run database instance then execute the folloeing

`$ npm pack bfast-database`

Command will download packed bfast-database in `.tgz` format

### Unpack bfast-database

Unpack the downloaded file `$ tar -xf bfast-database-**.tgz`. Note `**` mean any latest version number fill will be
tagged to.

### Run bfast-database

After unpack you bfast-database files will be inside `package` folder.

Start in restart mode

        $ cd package
        $ bfast functions serve  --port 3000 

Start in non - restart mode

        $ cd package
        $ bfast functions serve --static --mongodb-url="${MONGO_URL}"  --port 3000

Then your bfast-database instance is up and running.

## Configurations

You put all configurations in ENV if you want a node module version please see
[bfast-database-core](https://github.com/fahamutech/bfast-database-core)

Mandatory envs

      - APPLICATION_ID=bfast // supply appId the default or when PRODUCTION === '0' is [ bfast ]
      - MASTER_KEY=bfast // your master key default or when PRODUCTION === '0' is [ bfast ]
      - PROJECT_ID=bfast // your projectId default or when PRODUCTION === '0' is [ bfast ] 
      - MONGO_URL="mongodb://localhost/test"// mongodb url to save your data, if in development mode and you don't supply it default is [ 'mongodb://localhost/bfast' ]
      - PORT=3000 // port to serve bfast-database if you use bfast-tools it will pick the port you specify with --port or 3000 as default
      - RSA_KEY='{..}' // stringfy JSON of your rsa private key for signed jwt
      - RSA_PUBLIC_KEY='{..}' // stringfy of your rsa public key for signed jwt

Optional envs


      - PRODUCTION="0" // specify whether you run in production or developement mode when '0' is dev and '1' is production, default value is [ '0' ]

Storage if you want to use amazon s3 object storage, you must supply its configurations as follows. If not bfast-database will use gridfs api of mongodb

      - S3_BUCKET= // you s3 bucket name for aws storage 
      - S3_ACCESS_KEY= // you s3 access key for aws storage 
      - S3_SECRET_KEY= // your s3 secret key
      - S3_REGION=af-south-1 // your s3 region
      - S3_ENDPOINT=https://s3.af-south-1.amazonaws.com // your s3 endponit

Storage if you want to use GridFs when do not supply any of s3 configuration when you start bfast-database, and it will
opt to use GridFs.

## Example [ For Linux Users ]
Pull the repository `git clone https://github.com/fahamutech/bfast-database`.

Then run `start.js` file, just replace the env variable of your choice.

        $ node start.js

That's it. For documentation refer to  [bfast-database-core](https://github.com/fahamutech/bfast-database-core) repository

## More Documentations

1. [bfast-tools](https://github.com/fahamutech/bfast-tools)
1. [bfast-database-core](https://github.com/fahamutech/bfast-database-core)
1. [bfast-function](https://github.com/fahamutech/bfast-function)
1. [bfast website](https://bfast.fahamutech.com)

