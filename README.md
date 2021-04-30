# POWER SERVICES

Region: `ap-south-1` (Mumbai)

Project is structured using NestJS.
Infrastructure is managed using AWS CDK in `/infra`.

## Getting Started

To get started install both the root and `/infra` folders. Git-crypt has been used for environment variables so make sure to unlock and deployment to AWS is done using Serverless e.g. `sls deploy -s development -v`.

The project uses NestJS' monolith structure with libraries for user auth/database etc. The Power library is where most of the server logic is handled. Both app routes live in `/apps/app` and cms in `/apps/cms`.

To deploy the infrastructure checkout the AWS CDK docs as well as the `package.json` inside the `/infra` folder. Most infrastructure services are not overwritten and will require manual deletion to remove.

## Features

### Routes

#### `/cms`

Authorised HttpAPI with Authoriser

#### `/graphql`

App facing unauthorised HttpAPI

#### `auth`

App facing authorised HttpAPI with Authorised (also includes the whole `/graphql` schema.

### Video Encoding

`/videoEncoding` includes two JSON files which are used for encoding videos uploaded to a specific s3 bucket. Deploying the [foundation video on demand](https://aws.amazon.com/solutions/implementations/video-on-demand-on-aws/) and replacing the default service files in the source bucket.
When uploading to the `assets01` folder the job will start and when finished place in the destination folder. Each video will have an appended `_1080` or `480` depending on quality. This can then be used for fetch videos based on user preferences.

### Database

The database structure is separated for `user` data and `power` data using RDS PostgreSQL.

### Cloudfront

If VIDEO_CLOUDFRONT_ENABLED is set to true, links will be served via an autheticated cloudfront distribution rather than
S3 directly. Due to limits on ENV size, the cloudfront keys are loaded from SSM Parameter Store. The expected keys are:

- `/power/{stage}/cloudfront/keypair-id`: The distribution keypair id for the private key
- `/power/{stage}/cloudfront/private-key`: The private key for one of the signing groups
- `/power/{stage}/cloudfront/url`: the url of the distribution (e.g. https://example.cloudfront.com)

A suitable distribution is deployed as part of the video encoding stack, however this must be manually configured to
require authentication following the steps in [the AWS documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-task-list.html)
