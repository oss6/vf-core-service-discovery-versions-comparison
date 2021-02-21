declare module 'vf-core-service-discovery-versions-comparison' {
  import { PassThrough } from 'stream';

  export default function vfCoreServiceDiscoveryVersionsComparison(
    rootDirectory: string,
    dataFileName: string | object,
    logStream: PassThrough
  ): Promise<void>;
}
