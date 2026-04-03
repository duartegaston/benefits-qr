export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
export const TIMEZONE_AR = "America/Argentina/Buenos_Aires";

export const SESSION_DURATION = {
  CLIENTE_MAGIC_LINK: 1,
  CLIENTE_RECLAMO: 24,
  LOCAL_ONBOARDING: 2,
} as const;

export const QR_EXPIRY_MINUTES = 2;
