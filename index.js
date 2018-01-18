const fs = require('fs');
const path = require('path');
const mime = require('mime');
const AWS = require('aws-sdk');

const region = process.env.REGION;
const bucket = process.env.BUCKET;
const accessKeyId = process.env.ACCESSKEYID;
const secretAccessKey = process.env.ACCESSKEY;

if (!region || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error('Please provide all the environment variables: REGION, BUCKET, KEYID, ACCESSKEY');
}

const awsConfig = {
  accessKeyId,
  secretAccessKey
};

const fileName = process.env.FILE || 'test.json';
const root = process.cwd();
const pathToFile = path.join(root, fileName);
const typeOfFile = mime.getType(fileName);
let pathToSave = `${new Date().getTime()}`;

if (typeOfFile) {
  pathToSave = `${pathToSave}.${mime.getExtension(typeOfFile)}`;
}

AWS.config.region = region;
AWS.config.update(awsConfig);

const s3 = new AWS.S3();

function amazonPutObject(path, cb) {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err);

      return;
    }

    const params = {
      Bucket: bucket,
      Key: pathToSave,
      Body: new Buffer(data),
      ACL: 'public-read',
      CacheControl: 'max-age=2628000'
    };

    if (typeOfFile) {
      params.ContentType = typeOfFile;
    }

    s3.putObject(params, cb);
  });
}

amazonPutObject(pathToFile, err => {
  if (err) {
    console.error('Status: error: ', err);

    return;
  }

  console.log('Status: successful');
});
