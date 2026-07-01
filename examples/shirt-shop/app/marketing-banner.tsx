'use client';

import { track } from '@vercel/analytics';
import { useEffect } from 'react';

export function MarketingBanner(props: { show: boolean }) {
  useEffect(() => {
    if (props.show) track('marketing_banner:viewed');
  }, [props.show]);

  if (!props.show) return null;

  return (
    <div className="bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white">
      Dashboard-controlled launch offer is enabled for this visitor.
    </div>
  );
}
