variable "domainName" {
  default = "www.example.com"
  type    = string
}

variable "bucketName" {
  default = "whiteboard-app-bucket"
  type    = string
}

variable "elasticContainerRegistryName" {
  default = "whiteboard-app-container-registry"
  type = string
}

variable "appRunnerName" {
  default = "whiteboard-app-runner"
  type = string
}