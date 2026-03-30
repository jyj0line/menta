import { sharedEnvsSchema } from "@/getEnvs/getSharedEnvs.schema";

export const sharedEnvs = sharedEnvsSchema.parse({
  NEXT_PUBLIC_NEXTJS_ORIGIN: process.env.NEXT_PUBLIC_NEXTJS_ORIGIN,
  NEXT_PUBLIC_SUPABASE_API_PROJECT_URL: process.env.NEXT_PUBLIC_SUPABASE_API_PROJECT_URL,
  NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE: process.env.NEXT_PUBLIC_SUPABASE_AK_PUBLISHABLE,
});