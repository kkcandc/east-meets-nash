const DEFAULT_SITE_URL = "https://eastmeetsnash.com";

function normalizeSiteUrl(value: string | undefined): URL {
  const rawValue = value?.trim() || DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    const url = new URL(withProtocol);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrl(): URL {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL);
}

export function getAbsoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}
