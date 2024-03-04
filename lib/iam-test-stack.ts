import * as cdk from "aws-cdk-lib";
import { ArnPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class IamTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userShowPreferencesBucket = new Bucket(this, "UserShowPreferences");

    const prefenceUploader = new Function(this, "UserPreferencesUploader", {
      runtime: Runtime.PYTHON_3_8,
      handler: "uploadUserShowsToBucket.handler",
      code: Code.fromAsset("lambda"),
      environment: {
        BUCKET_NAME: userShowPreferencesBucket.bucketName,
      },
    });

    const putObjectsPolicyStatement = new PolicyStatement({
      actions: ["s3:PutObject"],
      resources: [`${userShowPreferencesBucket.bucketArn}/*`], // Allows PutObject action on all objects within the bucket
    });
    prefenceUploader.addToRolePolicy(putObjectsPolicyStatement);

    // Example 2, place the policy statement on the resource instead of the identity
    if (typeof prefenceUploader.role?.roleArn === "undefined") {
      throw new Error("roleArn is undefined");
    }

    const resourcePutObjStatement = new PolicyStatement({
      actions: ["s3:PutObject"],
      resources: [`${userShowPreferencesBucket.bucketArn}/*`],
      principals: [new ArnPrincipal(prefenceUploader.role?.roleArn)],
    });
    userShowPreferencesBucket.addToResourcePolicy(resourcePutObjStatement);
  }
}
