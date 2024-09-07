provider "google" {
  credentials = var.google_credentials
  project     = var.project_id
  region      = var.region
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  node_config {
    machine_type = var.machine_type
    disk_size_gb = var.disk_size
    oauth_scopes = ["https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/logging.write"]
  }

  initial_node_count = var.node_count

  # เปิดการใช้งาน Stackdriver logging และ monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  # เปิดใช้งาน network policy
  network_policy {
    enabled = true
  }
}

# สร้าง node pool พร้อม autoscaling
resource "google_container_node_pool" "primary_nodes" {
  cluster    = google_container_cluster.primary.name
  location   = var.region
  node_count = var.node_count

  node_config {
    machine_type = var.machine_type
    disk_size_gb = var.disk_size
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }
}
