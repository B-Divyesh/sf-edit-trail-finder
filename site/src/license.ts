const SLUG = "edit-trail-finder";
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/verify`;

type Verdict = { valid: boolean; checkedAt: number; reason?: string };

export function captureReturnedLicense(locationUrl = window.location.href): string | null {
  const url = new URL(locationUrl);
  const token = url.searchParams.get("license");
  if (!token) return null;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

function cachedVerdict(): Verdict | null {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? "null") as Verdict | null; }
  catch { return null; }
}

export function optimisticallyUnlocked(): boolean {
  const verdict = cachedVerdict();
  return Boolean(localStorage.getItem(LICENSE_KEY) && verdict?.valid);
}

export async function verifyLicense(token: string, force = false): Promise<Verdict> {
  const cached = cachedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("License service is unavailable. Your free tools still work.");
  const body = await response.json() as { valid: boolean; reason?: string };
  const verdict = { valid: body.valid, reason: body.reason, checkedAt: Date.now() };
  localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
  if (verdict.valid) localStorage.setItem(LICENSE_KEY, token);
  return verdict;
}

export function savedLicense(): string | null { return localStorage.getItem(LICENSE_KEY); }
