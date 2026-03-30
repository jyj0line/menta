import { NextRequest } from 'next/server';

import { randomUUID } from 'crypto';

/*
// supabase local stack envrionment variables
// supabase local stack: Development Tools
SUPABASE_DT_STUDIO = http://127.0.0.1:54323
SUPABASE_DT_MAILPIT = http://127.0.0.1:54324
SUPABASE_DT_MCP = http://127.0.0.1:54321/mcp

// supabase local stack: APIs
SUPABASE_API_PROJECT_URL = http://127.0.0.1:54321
SUPABASE_API_REST = http://127.0.0.1:54321/rest/v1
SUPABASE_API_GRAPHQL = http://127.0.0.1:54321/graphql/v1 
SUPABASE_API_EDGE_FUNCTIONS = http://127.0.0.1:54321/functions/v1

// supabase local stack: Database
SUPABASE_DB_URL = postgresql://postgres:postgres@127.0.0.1:54322/postgres

// supabase local stack: Authentication Keys
SUPABASE_AK_PUBLISHABLE = sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_AK_SECRET = sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

// supabase local stack: Storage (S3)
SUPABASE_S_URL = http://127.0.0.1:54321/storage/v1/s3
SUPABASE_S_ACCESS_KEY = 625729a08b95bf1b7ff351a663f3a23c
SUPABASE_S_SECRET_KEY = 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
SUPABSE_S_REGION = local
*/

export const MOCKS = {
  PASSWORD: 'Password123!'
}

export const TEST_APIS = {
  SUPABASE_DT_MAILPIT: 'http://127.0.0.1:54324'
}

export const createMockRequest = (
  url: string,
  base: string
): NextRequest => {
  const newUrl = new URL(url, base);
  return new NextRequest(newUrl);
};

export const createMockFormData = (data: Partial<Record<string, string>>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    formData.append(key, value);
  })
  return formData;
}

export const createMockEmail = ():string => {
  return `test+${randomUUID()}@example.com`;
}