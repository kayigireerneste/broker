import { jwtVerify, SignJWT, type JWTPayload } from "jose";

const SECRET = process.env.JWT_SECRET || "wamenyeryari";
const secretKey = new TextEncoder().encode(SECRET);

export const generateToken = async (payload: Record<string, unknown>) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("7d")
    .sign(secretKey);
};

export const verifyToken = async <T extends JWTPayload = JWTPayload>(token: string) => {
  const { payload } = await jwtVerify<T>(token, secretKey);
  return payload;
};
