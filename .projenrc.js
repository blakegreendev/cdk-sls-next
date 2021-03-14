const { web, AwsCdkTypeScriptApp } = require('projen');

const cdkProject = new AwsCdkTypeScriptApp({
  cdkVersion: '1.93.0',
  jsiiFqn: "projen.AwsCdkTypeScriptApp",
  name: 'cdk-sls-next',

  cdkDependencies: [
    '@aws-cdk/aws-appsync',
    '@aws-cdk/aws-cognito',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-route53',
    '@aws-cdk/aws-certificatemanager',
    '@aws-cdk/core',
  ],
  deps: [
    'cdk-appsync-transformer',
    '@sls-next/cdk-construct',
    '@sls-next/lambda-at-edge'
  ],

  gitignore: [
    'appsync/',
  ],
});

cdkProject.setScript('cdkDeploy', 'cdk deploy --all');
cdkProject.setScript('cdkDestroy', 'cdk destroy --all');

cdkProject.synth();

const webProject = new web.NextJsTypeScriptProject({
  name: 'cdk-sls-next-frontend',
  parent: cdkProject,
  outdir: 'frontend',

  deps: [
    '@aws-amplify/auth',
    '@aws-amplify/ui-components',
    '@aws-amplify/ui-react',
    'aws-amplify',
    'react-query',
    'react-router',
    'react-router-dom',
  ],
  devDeps: [
    '@graphql-codegen/cli',
    '@graphql-codegen/typescript',
    '@graphql-codegen/typescript-operations',
    '@graphql-codegen/typescript-react-query@alpha',
    'amplify-graphql-docs-generator',
    'aws-sdk@^2',
    'graphql',
  ],

  gitignore: [
    'aws-exports.js',
  ],

  tsconfig: {
    compilerOptions: {
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: false,
      module: 'esnext',
      moduleResolution: 'node',
      isolatedModules: true,
      noEmit: true,
      jsx: 'preserve',
    },
  },
});

webProject.addTask('generate-exports', {
  description: 'Generates aws-exports.js',
  exec: 'node bin/generateExports.js',
});

webProject.addTask('copy-schema', {
  exec: 'cp ../appsync/schema.graphql ./schema.graphql',
});

webProject.addTask('generate-statements', {
  exec: 'node bin/generateStatements.js',
});

webProject.addTask('codegen', {
  description: 'Copies the backend schema and generates frontend code',
  exec: 'yarn run copy-schema && yarn run generate-statements && graphql-codegen --config codegen.yml && rm schema.graphql',
});

webProject.synth();