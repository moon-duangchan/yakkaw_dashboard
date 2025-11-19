
import { NextRequest } from "next/server";
import { decode, type JwtPayload } from "jsonwebtoken";

export interface DecodedUser extends JwtPayload {
  username?: string;
  role?: string;
  [key: string]: unknown;
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const decodeToken = (): DecodedUser | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = decode(token);
    if (!decoded || typeof decoded === "string") {
      return null;
    }
    return decoded as DecodedUser;
  } catch (error) {
    console.error("Invalid Token", error);
    return null;
  }
};

export function extractUserFromCookie(request: NextRequest): DecodedUser | null {
  const token = request.cookies.get("jwt")?.value;

  if (!token) return null;

  try {
    const decoded = decode(token);
    if (!decoded || typeof decoded === "string") {
      return null;
    }
    return decoded as DecodedUser;
  } catch (error) {
    console.error("Error decoding token", error);
    return null;
  }
}
