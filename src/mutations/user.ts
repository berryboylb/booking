import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
} from "graphql";
import {
  UserType,
  CreateUserInputType,
  LoginUserInputType,
  UpdateUserInputType,
} from "../schema/user";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import {
  userValidationSchema,
  loginValidationSchema,
  updateUserValidationSchema,
} from "../validator/user";
import { hashPassword, checkPassword } from "../utils/hash";
import { getToken } from "../utils/token";
import { authenticateToken } from "../middleware/auth";
import { client } from "../utils/cache";
import { z } from "zod";
export const createUser: GraphQLFieldConfig<any, any> = {
  type: UserType,
  args: {
    body: { type: new GraphQLNonNull(CreateUserInputType) },
  },
  async resolve(parent, { body }) {
    try {
      const req = await userValidationSchema.parseAsync(body);
      const hash = await hashPassword(req.password);
      const user = await prisma.user.create({
        data: {
          ...req,
          password: hash,
        },
      });
      return user;
    } catch (error) {
      console.log({ error });
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(`User with the email ${body.email} already exists.`);
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        console.log({ error });
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

const LoginResponseType = new GraphQLObjectType({
  name: "LoginResponseType",
  fields: () => ({
    user: { type: UserType },
    accessToken: { type: GraphQLString },
  }),
});

export const loginUser: GraphQLFieldConfig<any, any> = {
  type: LoginResponseType,
  args: {
    body: { type: new GraphQLNonNull(LoginUserInputType) },
  },
  async resolve(parent, { body }) {
    try {
      const req = await loginValidationSchema.parseAsync(body);
      const user = await prisma.user.findUnique({
        where: {
          email: req.email,
        },
      });
      if (!user) throw new Error("invalid credentials");
      const isMatch = await checkPassword(req.password, user.password);
      if (!isMatch) throw new Error("invalid credentials");
      const accessToken = getToken(user.id);
      return {
        accessToken,
        user,
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`db query error: ${error.meta?.cause} `);
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error(`db connection error b: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

export const updateUser: GraphQLFieldConfig<any, any> = {
  type: UserType,
  args: {
    body: { type: new GraphQLNonNull(UpdateUserInputType) },
  },
  async resolve(parent, { body }, context, info) {
    try {
      const { id } = await authenticateToken(context);
      const req = await updateUserValidationSchema.parseAsync(body);
      const user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...req,
          updatedAt: new Date(),
        },
      });
      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error("error fetching from database: " + error.message);
      } else {
        throw error;
      }
    }
  },
};

export const deleteUser: GraphQLFieldConfig<any, any> = {
  type: GraphQLBoolean,
  async resolve(parent, args, context, info) {
    try {
      const { id } = await authenticateToken(context);
      await prisma.booking.deleteMany({
        where: {
          userId: {
            in: [id],
          },
        },
      });
      const deletedUser = await prisma.user.delete({
        where: {
          id,
        },
      });

      if (deletedUser) {
        await client.del(id);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error("error fetching from database: " + error.message);
      } else {
        throw error;
      }
    }
  },
};
