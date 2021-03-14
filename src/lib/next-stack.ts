import { NextJSLambdaEdge } from "@sls-next/cdk-construct";
import * as certMgr from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as cdk from "@aws-cdk/core";

export class NextStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const hostedZone = route53.HostedZone.fromLookup(this, "hostedzone", {
      domainName: "blakegreen.dev",
    });

    const certificate = new certMgr.DnsValidatedCertificate(this, "cert-site", {
      domainName: "nextsls.blakegreen.dev",
      hostedZone,
    });

    new NextJSLambdaEdge(this, "NextJsApp", {
      serverlessBuildOutDir: "./frontend/build",
      domain: {
        domainName: "nextsls.blakegreen.dev",
        hostedZone,
        certificate,
      },
    });
  }
}
