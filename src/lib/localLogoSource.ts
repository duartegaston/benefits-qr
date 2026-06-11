import { logoVersion } from "@/lib/logoVersion";

type LocalLogoSourceInput = {
  localId: string | null | undefined;
  logoUrl: string | null | undefined;
};

export function getLocalLogoDisplayUrl({ localId, logoUrl }: LocalLogoSourceInput): string | null {
  if (!localId || !logoUrl) {
    return null;
  }

  const version = logoVersion(logoUrl);

  return `/api/locales/${localId}/logo?v=${version}`;
}
