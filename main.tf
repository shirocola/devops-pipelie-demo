provider "google" {
    credentials = file("path/to/your-credentials.json")  # ใช้ Google Cloud service account credentials
    project = "project-id"
    region = "southasia-east1"
}

resource "google_container_cluster" "primary" {
    name  = "gke-cluster"
    location = "southasia-east1"
    initial_node_count = 3
    node_config {
      preemptible = true
      machine_type = "e2-medium"
      disk_size_gb = 30
    }

}