export const RAILWAY_DEPLOY_LOGS_SUBSCRIPTION = `subscription streamEnvironmentLogs($environmentId: String!, $filter: String, $beforeLimit: Int!, $beforeDate: String, $anchorDate: String, $afterDate: String, $afterLimit: Int) {
  environmentLogs(
    environmentId: $environmentId
    filter: $filter
    beforeDate: $beforeDate
    anchorDate: $anchorDate
    afterDate: $afterDate
    beforeLimit: $beforeLimit
    afterLimit: $afterLimit
  ) {
    ...LogFields
  }
}

fragment LogFields on Log {
  timestamp
  message
  severity
  tags {
    projectId
    environmentId
    pluginId
    serviceId
    deploymentId
    deploymentInstanceId
    snapshotId
  }
  attributes {
    key
    value
  }
}`;
