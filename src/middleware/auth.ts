import express, { Request, Response, NextFunction } from "express";
import { decodeToken } from "../utils/token";
import prisma from "../prisma";
import { client, connect, disconnect } from "../utils/cache";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}
export const authenticateToken = async (context: any) => {
  try {
    if (!context.headers.authorization)
      throw new Error("Authorization header not found");
    const token = context.headers.authorization.split(" ")[1];
    if (!token) throw new Error("Token not found in the header");
    const decoded = decodeToken(token);
    const userData = await client.get(decoded.id);
    if (userData) return JSON.parse(userData) as User;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) throw new Error("invalid token");
    await client.SET(decoded.id, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
