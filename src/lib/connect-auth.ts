import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "connector.session-token";
const MAX_AGE = 8 * 60 * 60;
const ALGORITHM = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET must be set");
  return new TextEncoder().encode(secret);
}

export interface ConnectorTokenPayload {
  connectorId: string;
  email: string;
  name: string;
  connectorCode: string;
  type: "connector";
}

export async function signConnectorToken(payload: ConnectorTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyConnectorToken(token: string): Promise<ConnectorTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALGORITHM] });
    if (payload.type !== "connector") return null;
    return payload as unknown as ConnectorTokenPayload;
  } catch {
    return null;
  }
}

export async function setConnectorSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearConnectorSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.set(COOKIE_NAME, "", { path: "/connect", maxAge: 0 });
}

export async function getConnectorSession(request?: NextRequest): Promise<ConnectorTokenPayload | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyConnectorToken(token);
}
