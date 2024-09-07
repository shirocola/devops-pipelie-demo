provider "google" {
    credentials = file("path/to/your-credentials.json")  # ใช้ Google Cloud service account credentials
    project = "project-id"
    region = "southasia-east1"
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
