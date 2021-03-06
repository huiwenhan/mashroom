
import context from '../context';
import ScanK8SPortalRemoteAppsBackgroundJob from '../jobs/ScanK8SPortalRemoteAppsBackgroundJob';
import KubernetesConnector from '../k8s/KubernetesConnector';
import DummyKubernetesConnector from '../k8s/DummyKubernetesConnector';
import {startExportRemoteAppMetrics, stopExportRemoteAppMetrics} from '../metrics/remote_app_metrics';

import type {MashroomRemotePortalAppRegistryBootstrapFunction} from '@mashroom/mashroom-portal/type-definitions';

const bootstrap: MashroomRemotePortalAppRegistryBootstrapFunction = async (pluginName, pluginConfig, pluginContextHolder) => {
    const pluginContext = pluginContextHolder.getPluginContext();
    const {k8sNamespaces, socketTimeoutSec, scanPeriodSec, refreshIntervalSec, serviceNameFilter, accessViaClusterIP} = pluginConfig;

    const kubernetesConnector = process.env.DUMMY_K8S_CONNECTOR ? new DummyKubernetesConnector() : new KubernetesConnector();

    const backgroundJob = new ScanK8SPortalRemoteAppsBackgroundJob(
        k8sNamespaces, serviceNameFilter, socketTimeoutSec, scanPeriodSec,
        refreshIntervalSec, accessViaClusterIP, kubernetesConnector, pluginContext.loggerFactory);

    backgroundJob.start();
    startExportRemoteAppMetrics(pluginContextHolder);

    pluginContext.services.core.pluginService.onUnloadOnce(pluginName, () => {
        backgroundJob.stop();
        stopExportRemoteAppMetrics();
    });

    context.serviceNameFilter = serviceNameFilter;

    return context.registry;
};

export default bootstrap;

