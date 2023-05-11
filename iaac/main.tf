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

resource "aws_s3_bucket" "client" {
  bucket = var.bucketName
}

output "s3-bucket" {
  value = aws_s3_bucket.client
}

resource "aws_s3_bucket_website_configuration" "bucket_web_config" {
  bucket = aws_s3_bucket.client.bucket
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_ownership_controls" "ownership_controls" {
  bucket = aws_s3_bucket.client.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access_block" {
  bucket = aws_s3_bucket.client.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.ownership_controls,
    aws_s3_bucket_public_access_block.public_access_block,
  ]

  bucket = aws_s3_bucket.client.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.client.id
  policy = templatefile("s3-policy.json", { bucket = var.bucketName })
  depends_on = [
    aws_s3_bucket_acl.acl
  ] 
}


# resource "aws_ecr_repository" "server_container_registry" {
#   name = var.elasticContainerRegistryName
# }

# resource "aws_ecr_lifecycle_policy" "lifecycle_policy" {
#   repository = aws_ecr_repository.server_container_registry.name

#   policy = templatefile("ecr-policy.json", {})
#   depends_on = [
#     aws_ecr_repository.server_container_registry
#    ]
# }

# output "aws_ecr_repository_service" {
#   value = aws_ecr_repository.server_container_registry
# }

# resource "aws_apprunner_auto_scaling_configuration_version" "scaling_config" {
#   auto_scaling_configuration_name = "auto_scaling_config"
#   # scale between 1-5 containers
#   min_size = 1
#   max_size = 1
# }

# resource "aws_apprunner_service" "server" {
#   auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.scaling_config.arn

#   service_name = var.appRunnerName

#   source_configuration {
#     image_repository {
#       image_configuration {
#         port = "8080"
#       }

#       image_identifier       = "${aws_ecr_repository.server_container_registry.repository_url}:latest"
#       image_repository_type = "ECR" // Private repository
#     }

#     authentication_configuration {
#       access_role_arn =  aws_iam_role.app_runner.arn
#     }

#     auto_deployments_enabled = true
#   }

#   instance_configuration {
#     cpu = "1 vCPU"
#     memory = "2 GB"
#   }

#   depends_on = [
#     aws_ecr_repository.server_container_registry,
#     aws_ecr_lifecycle_policy.lifecycle_policy,
#     aws_apprunner_auto_scaling_configuration_version.scaling_config,
#   ]
# }

# resource "aws_iam_role" "app_runner" {
#   name = "MyAppRunnerServiceRole"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = "sts:AssumeRole"
#         Effect = "Allow"
#         Sid    = ""
#         Principal = {
#           Service = "build.apprunner.amazonaws.com"
#         }
#       },
#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "app_runner" {
#   role       = aws_iam_role.app_runner.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
# }

# output "apprunner_service_server" {
#   value = aws_apprunner_service.server
# }