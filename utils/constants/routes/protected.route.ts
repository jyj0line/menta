import { ValuesFromObject } from "@/utils/types/util.type";

export const PROTECTED_ROUTES = {
  MY: '/my'
} as const;
export type ProtectedRoutes = typeof PROTECTED_ROUTES;
export type ProtectedRoute = ValuesFromObject<ProtectedRoutes>;