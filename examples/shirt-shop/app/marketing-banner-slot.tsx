import { headers } from 'next/headers';
import { marketingBannerFlag } from '@/flags';
import { MarketingBanner } from './marketing-banner';

export async function MarketingBannerSlot() {
  const header = await headers();
  const country = header.get('x-vercel-ip-country') ?? undefined;
  const showMarketingBanner = await marketingBannerFlag();

  return <MarketingBanner country={country} show={showMarketingBanner} />;
}
