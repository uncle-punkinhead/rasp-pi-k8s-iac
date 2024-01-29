using System.Collections.Generic;
using Pulumi;
using Kubernetes = Pulumi.Kubernetes;

return await Deployment.RunAsync(() => 
{
    var config = new Config();
    var appLabels = new InputMap<string>
    {
        { "app", "kube-prometheus-stack" },
    };

    var nameSpace = new Kubernetes.Core.V1.Namespace("prometheus-ns", new()
    {
        Metadata = new Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs
        {
            Labels = appLabels,
            Name = config.Get("k8sNamespace") ?? "default",
        },
    });

    var promtheusStack = new Kubernetes.Helm.V3.Release("kube-prometheus-stack", new()
    {
        Chart = "kube-prometheus-stack",
        Namespace = nameSpace.Metadata.Apply(m => m.Name),
        RepositoryOpts = new Kubernetes.Types.Inputs.Helm.V3.RepositoryOptsArgs
        {
            Repo = "https://prometheus-community.github.io/helm-charts",
        },
        SkipCrds = false,
//        Values = new Dictionary<string, object>
//        {
//            ["controller"] = new Dictionary<string, object>
//            {
//                ["enableCustomResources"] = "false",
//                ["appprotect"] = new Dictionary<string, object>
//                {
//                    ["enable"] = "false"
//                },
//                ["appprotectdos"] = new Dictionary<string, object>
//                {
//                    ["enable"] = "false"
//                },
//                ["service"] = new Dictionary<string, object>
//                {
//                    ["extraLabels"] = appLabels
//                },
//            },
//        },
        Version = "56.2.1",
    });

    return new Dictionary<string, object?>
    {
        ["name"] = promtheusStack.Name,
    };
});
