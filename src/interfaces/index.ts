import * as PhosphorIcons from "@phosphor-icons/react";

// export const Icons = {
//   BriefcaseIcon,
//   HouseIcon,
//   HandTapIcon,
//   ReadCvLogoIcon,
//   UserCircleIcon,
//   MailboxIcon,
//   ChartLineUpIcon,
//   ArticleNyTimesIcon,
//   CodeIcon,
//   WhatsappLogoIcon,
//   DeviceMobileIcon,
//   GlobeIcon,
//   HeartIcon,
//   PottedPlantIcon,
//   StarIcon,
//   TargetIcon,
//   WarningIcon,
//   XCircleIcon,
// } as const;

export type IconName = keyof typeof PhosphorIcons;

export interface RecommendResponse {
  title: string;
  synopsis: string;
  release_date: string;
  poster: string;
  rating: number;
  streaming: ProviderOptions[];
  rent: ProviderOptions[];
  buy: ProviderOptions[];
}

export interface ProviderOptions {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}
