terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.22.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "eu-central-1"
}

resource "aws_apprunner_auto_scaling_configuration_version" "hello" {                            
  auto_scaling_configuration_name = "hello"
  # scale between 1-5 containers
  min_size = 1
  max_size = 1
}

resource "aws_apprunner_service" "hello" {                            
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.hello.arn                          
         
  service_name = "hello-app-runner"                          
                            
  source_configuration {                              
    image_repository {                                
      image_configuration {                                  
        port = "8000"                                
      }                                
      
      image_identifier       = "public.ecr.aws/aws-containers/hello-app-runner:latest"                                
      image_repository_type = "ECR_PUBLIC"                              
    }                          
                              
    auto_deployments_enabled = false                            
  }                          
}
output "apprunner_service_hello" {                            
  value = aws_apprunner_service.hello                          
}

resource "aws_s3_bucket" "example" {
  bucket = var.bucketName
}

resource "aws_s3_bucket_website_configuration" "example-config" {
  bucket = aws_s3_bucket.example.bucket
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "example" {
  bucket = aws_s3_bucket.example.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "example" {
  depends_on = [
    aws_s3_bucket_ownership_controls.example,
    aws_s3_bucket_public_access_block.example,
  ]

  bucket = aws_s3_bucket.example.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "example-policy" {
  bucket = aws_s3_bucket.example.id
  policy = templatefile("s3-policy.json", { bucket = var.bucketName })
  depends_on = [
    aws_s3_bucket_acl.example
  ] 
}

resource "aws_ecr_repository" "foo" {
  name = var.elasticContainerRegistryName
}

resource "aws_ecr_lifecycle_policy" "foopolicy" {
  repository = aws_ecr_repository.foo.name

  policy = templatefile("ecr-policy.json", {})
  depends_on = [
    aws_ecr_repository.foo
   ]
}

output "aws_ecr_repository_service" {
  value = aws_ecr_repository.foo
  
}