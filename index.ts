import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";

const config = new pulumi.Config();
const k8sNamespace = config.get("k8sNamespace") || "default";
const appLabels = {
    app: "nginx-ingress",
};

// Create a namespace (user supplies the name of the namespace)
const monitoringNamespace = new kubernetes.core.v1.Namespace("monitoring", {
    metadata: {
        name: "monitoring"
    }
});

// Use Helm to install the Nginx ingress controller
const metricsServer = new kubernetes.helm.v3.Release("metrics-server", {
    chart: "metrics-server",
    namespace: monitoringNamespace.metadata.name,
    repositoryOpts: {
        repo: "https://kubernetes-sigs.github.io/metrics-server",
    },
    name: "metrics-server"
});

// Export some values for use elsewhere
export const name = metricsServer.name;
