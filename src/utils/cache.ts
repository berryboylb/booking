import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  database: Number(process.env.DB),
});

export const connect = async () => client.connect();


export const disconnect = async () => client.disconnect();