import { createHash } from "crypto";

export function logoVersion(logoUrl: string | null | undefined): string {
  if (!logoUrl) return "0";
  return createHash("md5").update(logoUrl).digest("hex").slice(0, 8);
}
