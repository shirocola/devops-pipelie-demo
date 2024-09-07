output "kubernetes_cluster_name" {
  description = "The name of the GKE Kubernetes cluster"
  value       = google_container_cluster.primary.name
}

output "kubernetes_cluster_endpoint" {
  description = "The endpoint (IP) for the GKE cluster"
  value       = google_container_cluster.primary.endpoint
}

output "kubernetes_cluster_ca_certificate" {
  description = "The base64 encoded CA certificate for the GKE cluster"
  value       = google_container_cluster.primary.master_auth.0.cluster_ca_certificate
}

output "container_registry_url" {
  description = "The URL of the Google Container Registry (GCR)"
  value       = "gcr.io/${var.project_id}"
}

output "gke_project_id" {
  description = "The Google Cloud Project ID"
  value       = var.project_id
}
