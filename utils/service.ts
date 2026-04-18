import { revalidatePath as nextjsRevalidatePath } from 'next/cache';
import { redirect as nextjsRedirect } from 'next/navigation';

import { getSafePathname } from '@/utils/helper.route';

// cache service interface & implementaion-
type RevalidatePathType = 'layout' | 'page';

export interface CacheService {
  revalidatePathname(path: string, type: RevalidatePathType): void;
}

export class NextjsCacheService implements CacheService {
  revalidatePathname(path: string, type: RevalidatePathType) {
    nextjsRevalidatePath(getSafePathname(path), type);
  }
}
// -cache service interface & implementaion



// redirect service interface & implementaion-
export interface RedirectService {
  redirect(path: string): never;
}

export class NextjsRedirectService implements RedirectService {
  redirect(path: string): never {
    nextjsRedirect(getSafePathname(path));
  }
}
// -redirect service interface & implementaion