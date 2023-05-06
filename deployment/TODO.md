- Create the following resources using Terraform:
  ✅ App Runner
  ✅ ECR
  ✅ S3 bucket
  Route 53

- Add Github Action that creates a new Container image and published to above ECR, and let App Runner auto deploy.
  https://dev.to/aws-builders/deploying-a-container-image-to-aws-ecr-using-a-github-action-k33

- Add S3 bucket for the React App.
  https://dev.to/aws-builders/build-a-static-website-using-s3-route-53-with-terraform-1ele

- Create Github action that publishes to this bucket. (Make sure it never published any server related data).
  https://blog.devgenius.io/deploy-a-react-app-to-amazon-s3-using-github-actions-and-bitbucket-pipelines-74791ae10a7c
