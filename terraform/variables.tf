variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "The region where resources will be deployed"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
  default     = "gke-cluster"
}

variable "node_count" {
  description = "The number of nodes in the GKE cluster"
  type        = number
  default     = 3
}

variable "machine_type" {
  description = "The type of machine to use for the GKE nodes"
  type        = string
  default     = "e2-medium"
}

variable "disk_size" {
  description = "The size of the disk attached to each GKE node (in GB)"
  type        = number
  default     = 30
}
