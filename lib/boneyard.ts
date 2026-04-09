import { headers } from "next/headers";
import { type NextRequest } from "next/server";

function matchesBoneyardAgent(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }

  return /HeadlessChrome|Playwright/i.test(userAgent);
}

function matchesLocalHost(host: string | null) {
  return Boolean(host && /localhost|127\.0\.0\.1/i.test(host));
}

export function isBoneyardRequest(request: NextRequest) {
  return matchesBoneyardAgent(request.headers.get("user-agent")) && matchesLocalHost(request.headers.get("host"));
}

export async function isBoneyardServerRequest() {
  const headerStore = await headers();
  return matchesBoneyardAgent(headerStore.get("user-agent")) && matchesLocalHost(headerStore.get("host"));
}
