export interface AtxpBalance {
  usdc: number;
  iou: number;
  total: number;
  mode: "mock" | "live";
}

export function getAccountsApiUrl(): string {
  return process.env.ACCOUNTS_API_URL || "https://accounts.atxp.ai";
}

export function getConnectionTokenFromHeaders(headers: Headers): string | undefined {
  const auth = headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.replace("Bearer ", "");
  const cookie = headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)connection_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function toBasicAuth(token: string): string {
  return `Basic ${Buffer.from(`${token}:`).toString("base64")}`;
}

export async function getBalance(connectionToken?: string): Promise<AtxpBalance> {
  if (!connectionToken) {
    return { usdc: 18.4, iou: 0, total: 18.4, mode: "mock" };
  }

  const response = await fetch(`${getAccountsApiUrl()}/balance`, {
    headers: { Authorization: toBasicAuth(connectionToken) },
    cache: "no-store",
  });
  if (!response.ok) return { usdc: 0, iou: 0, total: 0, mode: "live" };
  const data = (await response.json()) as { balance?: { usdc?: string; iou?: string } };
  const usdc = Number.parseFloat(data.balance?.usdc || "0") || 0;
  const iou = Number.parseFloat(data.balance?.iou || "0") || 0;
  return { usdc, iou, total: usdc + iou, mode: "live" };
}
