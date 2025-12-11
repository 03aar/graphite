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
