import { marketingBannerFlag } from '@/flags';
import { MarketingBanner } from './marketing-banner';

export async function MarketingBannerSlot() {
  const showMarketingBanner = await marketingBannerFlag();

  return <MarketingBanner show={showMarketingBanner} />;
}
