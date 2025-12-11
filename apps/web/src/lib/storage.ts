import AWS from 'aws-sdk';

const s3Client = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  signatureVersion: 'v4',
});

const BUCKET = process.env.S3_BUCKET || 'leafit';

export async function uploadFile(key: string, body: Buffer | string, contentType?: string): Promise<string> {
  await s3Client
    .putObject({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    .promise();

  return key;
}

export async function getFile(key: string): Promise<Buffer> {
  const result = await s3Client
    .getObject({
      Bucket: BUCKET,
      Key: key,
    })
    .promise();

  return result.Body as Buffer;
}

export async function getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  return s3Client.getSignedUrlPromise('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresIn,
  });
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client
    .deleteObject({
      Bucket: BUCKET,
      Key: key,
    })
    .promise();
}

export async function listFiles(prefix: string): Promise<string[]> {
  const result = await s3Client
    .listObjectsV2({
      Bucket: BUCKET,
      Prefix: prefix,
    })
    .promise();

  return result.Contents?.map((obj) => obj.Key!).filter(Boolean) || [];
}
