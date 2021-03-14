import * as cdk from "@aws-cdk/core";
import { Builder } from "@sls-next/lambda-at-edge";
import { NextStack } from "./lib/next-stack";
import { BackendStack } from "./lib/backend-stack";

// Run the serverless builder, this could be done elsewhere in your workflow
const builder = new Builder("./frontend", "./frontend/build", {
  cwd: "./frontend",
  args: ["build"],
});

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

builder
  .build()
  .then(() => {
    const app = new cdk.App();

    new NextStack(app, `NextStack`, { env: devEnv });
    new BackendStack(app, `BackendStack`, { env: devEnv });

    app.synth();
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
