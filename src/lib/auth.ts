import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth-token";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: {
  userId: number;
  email: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<{ userId: number; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as { userId: number; email: string };
  } catch {
    return null;
  }
}
