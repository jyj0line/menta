import { createNavigation } from 'next-intl/navigation';

import { routingConfig } from '@/i18n/routing.cnfg';
 
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routingConfig);