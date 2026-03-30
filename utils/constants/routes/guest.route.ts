import { ValuesFromObject } from "@/utils/types/util.type";

export const GUEST_ROUTES = {
  SIGN_UP: '/signup',
  LOGIN: '/login'
} as const;
export type GuestRoutes = typeof GUEST_ROUTES;
export type GuestRoute = ValuesFromObject<GuestRoutes>;