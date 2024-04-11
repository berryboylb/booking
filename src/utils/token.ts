import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;

export const getToken = (id: string) =>
  jwt.sign(
    {
      id,
    },
    secret as string,
    {
      expiresIn: "1h",
    }
  );

export const decodeToken = (token: string): jwt.JwtPayload => {
  try {
    if (!secret) throw new Error("Missing secret key");
    const decoded = jwt.verify(token, secret);
    return decoded as jwt.JwtPayload;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
