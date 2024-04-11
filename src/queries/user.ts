import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfig,
} from "graphql";
import { UserType, UserFilterInputType } from "../schema/user";
import prisma from "../prisma";
import { authenticateToken } from "../middleware/auth";
import { userFilterValidationInputSchema } from "../validator/user";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const getUser: GraphQLFieldConfig<any, any> = {
  type: UserType,
  async resolve(parent, args, context, info) {
    return authenticateToken(context);
  },
};

const UsersResponseType = new GraphQLObjectType({
  name: "UsersReSponse",
  fields: () => ({
    data: { type: new GraphQLList(UserType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  }),
});

export const getUsers: GraphQLFieldConfig<any, any> = {
  type: UsersResponseType,
  args: {
    filter: { type: UserFilterInputType },
  },
  async resolve(parent, { filter }, context, info) {
    try {
      const { page, perPage, query, from, to } =
        await userFilterValidationInputSchema.parseAsync({ ...filter });
      const pageNum = page || 1;
      const perPageNum = perPage || 10;
      const skip = (pageNum - 1) * perPageNum;
      let whereClause: any = {};
      if (query) {
        whereClause.OR = [
          {
            name: {
              contains: query,
              mode: "insensitive", 
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive", 
            },
          },
        ];
      }
      if (from && to) {
        whereClause = {
          ...whereClause,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        };
      } else if (from) {
        whereClause = {
          ...whereClause,
          createdAt: { gte: new Date(from) },
        };
      }
      let obj = {
        where: whereClause,
        skip,
        take: perPage,
      };
      const users = await prisma.user.findMany(obj);
      const count = await prisma.user.count(obj);
      return {
        data: users,
        page: pageNum,
        perPage: perPageNum,
        total: count,
      };
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
