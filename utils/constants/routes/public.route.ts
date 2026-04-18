import { sharedEnv } from "@/getEnv/getSharedEnv";
import { ValuesFromObject } from "@/utils/type";

export const ORIGINS = {
  NEXTJS: sharedEnv.NEXT_PUBLIC_NEXTJS_ORIGIN
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