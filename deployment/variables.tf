variable "domainName" {
  default = "www.example.com"
  type    = string
}

variable "bucketName" {
  default = "collaborative-whiteboard-app-test-1234"
  type    = string
}

variable "elasticContainerRegistryName" {
  default = "whiteboard-app-registry"
  type = string
}