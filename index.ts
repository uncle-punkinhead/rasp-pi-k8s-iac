import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { readFileSync } from "fs";

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

const metricsServer = new kubernetes.helm.v3.Release("metrics-server", {
    chart: "metrics-server",
    namespace: monitoringNamespace.metadata.name,
    repositoryOpts: {
        repo: "https://kubernetes-sigs.github.io/metrics-server",
    },
    name: "metrics-server",
    values: {
        defaultArgs: [
            "--cert-dir=/tmp",
            "--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname",
            "--kubelet-use-node-status-port",
            "--metric-resolution=15s",
            "--kubelet-insecure-tls"
        ]
    }
});

const metalLb = new kubernetes.helm.v3.Release("metallb", {
    chart: "metallb",
    repositoryOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    name: "metallb",
});

const prometheusStack = new kubernetes.helm.v3.Release("prometheus-stack", {
    chart: "kube-prometheus-stack",
    namespace: monitoringNamespace.metadata.name,
    repositoryOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
    name: "kube-prometheus-stack",
    values: {
        namespaceOverride: metricsServer.namespace
    }
});

// Export some values for use elsewhere
export const metricsServerName = metricsServer.name;
export const prometheusStackName = prometheusStack.name;
export const readme = readFileSync("./Pulumi.README.md").toString();
