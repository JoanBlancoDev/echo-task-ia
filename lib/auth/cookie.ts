type Cookie = { name: string; value: string };

export function getSupabaseAccessTokenFromCookies(
  cookiesStore: { getAll: () => Cookie[] } | Cookie[]
): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = url?.split("https://")[1]?.split(".")[0];
  if (!projectRef) return undefined;
  const cookiePrefix = `sb-${projectRef}-auth-token`;


  const allCookies: Cookie[] = Array.isArray(cookiesStore)
    ? cookiesStore
    : cookiesStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith(cookiePrefix)) {
      return cookie.value;
    }
  }
  return undefined;
}