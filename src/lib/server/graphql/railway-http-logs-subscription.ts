export const RAILWAY_HTTP_LOGS_SUBSCRIPTION = `
subscription streamHttplogs($deploymentId: String!, $filter: String, $beforeLimit: Int!, $beforeDate: String!, $anchorDate: String, $afterDate: String) {
  httpLogs(
    deploymentId: $deploymentId
    filter: $filter
    beforeDate: $beforeDate
    anchorDate: $anchorDate
    afterDate: $afterDate
    beforeLimit: $beforeLimit
  ) {
    requestId
    timestamp
    method
    path
    host
    httpStatus
    upstreamProto
    downstreamProto
    responseDetails
    totalDuration
    upstreamAddress
    clientUa
    upstreamRqDuration
    txBytes
    rxBytes
    srcIp
    edgeRegion
  }
}
`;
