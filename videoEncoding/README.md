# Video Conversion

The workout videos are converted from a high-quality source video uploaded to CMS to 1080p and 480p versions more appropriate for mobile download. The actual conversion is handled by AWS MediaConvert and is orchestrated using a [Video on Demand Cloudformation Stack](https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws-foundations) provided by AWS.

The process works as follows:

1. A high quality source-video is uploaded to the video-source bucket
2. A lambda is triggered from the S3 upload completion event which kicks off a media convert job using the settings in `job-settings.json`, which is located in the assets folder in the source bucket.
3. Once conversion is complete the converted videos are output by MediaConvert into the root directory of the destination bucket.

## Deployment

Currently the videos for all environments are stored in the same destination bucket to simplify deployment. To deploy the conversion stack into a new region:

1. Follow the instructions on [the CloudFormation template page](https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws-foundations/template.html) to create the conversion resources.

2. Once deployed, find the newly created video-source bucket in the S3 console and upload the `job-settings.json` file into the root of the `assets01` folder.

3. Locate the `jobSubmit` function in the lambda console. In the index.js file find the line that defines the `outputPath` and modify this to exclude the generated `guid` variable (this allows us to generate the output file keys from the input filename):

```
// Original
const outputPath = `s3://${DESTINATION_BUCKET}/${guid}`;

// Modified
const outputPath = `s3://${DESTINATION_BUCKET}`;
```

4. In the same function, replace the `getPath` function in `updateJobSettings` with the following to exclude the GroupName from the output path:

```
    const getPath = (group, num) => {
        return `${outputPath}/`;
    };
```
