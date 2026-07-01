import { getProviderData as getVercelProviderData } from '@flags-sdk/vercel';
import { mergeProviderData } from 'flags';
import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import * as flags from '../../../../flags';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return mergeProviderData([
    getProviderData(flags),
    getVercelProviderData(flags),
  ]);
}) as any;
