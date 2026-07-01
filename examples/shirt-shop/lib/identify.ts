import type { Identify } from 'flags';
import { dedupe } from 'flags/next';
import { headers } from 'next/headers';
import { getStableId } from './get-stable-id';

export type EvaluationContext = {
  stableId?: string;
  request?: {
    country?: string;
  };
};

export const identify = dedupe(async () => {
  const stableId = await getStableId();
  const header = await headers();
  const country = header.get('x-vercel-ip-country') ?? undefined;

  return {
    stableId: stableId.value,
    request: country ? { country } : undefined,
  };
}) satisfies Identify<EvaluationContext>;
