import { sharedEnvs } from "@/getEnvs/getSharedEnvs";
import { ValuesFromObject } from "@/utils/types/util.type";

export const ORIGINS = {
  NEXTJS: sharedEnvs.NEXT_PUBLIC_NEXTJS_ORIGIN
};



export const PUBLIC_ROUTES = {
  ROOT: '/', // needs special security process(in route.helper.ts)
  ERROR: '/error',
} as const;
export type PublicRoutes = typeof PUBLIC_ROUTES;
export type PublicRoute = ValuesFromObject<PublicRoutes>;

export const DEFAULT_PUBLIC_ROUTES = {
  NEXT: PUBLIC_ROUTES.ROOT
} as const;