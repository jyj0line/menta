import { vi } from 'vitest';

vi.mock('server-only', () => ({}));



vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));



vi.mock('@supabase/ssr', async () => {
  const actualImport = await vi.importActual<typeof import('@supabase/ssr')>('@supabase/ssr');
  return {
    ...actualImport,
    createServerClient: vi.fn(),
    createBrowserClient: vi.fn()
  };
});



vi.mock('@/components/svgs/svgs', async (importOriginal) => {
  const originalImport = await importOriginal<typeof import('@/components/svgs/svgs')>();
  
  return Object.fromEntries(
    Object.keys(originalImport).map((key) => [
      key,
      (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />
    ])
  );
});



vi.mock('@/features/auth/auth.action', () => ({
  signupAction: vi.fn(),
  loginAction: vi.fn(),
}));