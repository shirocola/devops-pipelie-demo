provider "google" {
  credentials = var.google_credentials
  project     = var.project_id
  region      = var.region
}

variable "google_credentials" {
  type = string
}


resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  node_config {
    machine_type = var.machine_type
    disk_size_gb = var.disk_size
  }

  initial_node_count = var.node_count
}
