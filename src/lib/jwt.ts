import { SignJWT, jwtVerify } from "jose";
import type { UserType } from "./enums";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JWTPayload = {
  userId: string;
  userType: UserType;
};

export async function signToken(
  payload: JWTPayload,
  expiresIn: string
): Promise<string> {
  return new SignJWT({ userId: payload.userId, userType: payload.userType })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      userType: payload.userType as UserType,
    };
  } catch {
    return null;
  }
}
