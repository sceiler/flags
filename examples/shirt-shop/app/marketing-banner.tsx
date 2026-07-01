'use client';

import { track } from '@vercel/analytics';
import { useEffect } from 'react';

export function MarketingBanner(props: { country?: string; show: boolean }) {
  useEffect(() => {
    if (props.show) track('marketing_banner:viewed');
  }, [props.show]);

  if (!props.show) return null;

  const audience = props.country ? ` for ${props.country} visitors` : '';

  return (
    <div className="bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white">
      Regional launch offer{audience}: 20% off shirts today.
    </div>
  );
}
