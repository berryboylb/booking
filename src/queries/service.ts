import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLSchema,
} from "graphql";
import {
  ServiceType,
  ServiceFilterInputType,
  ServiceNormType,
} from "../schema/service";
import prisma from "../prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { serviceFilterValidationInputSchema } from "../validator/service";
import { idValidationSchema } from "../validator/booking";

const ServicesResponseType = new GraphQLObjectType({
  name: "ServicesReSponse",
  fields: () => ({
    data: { type: new GraphQLList(ServiceType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  }),
});

export const ServiceQueryType: GraphQLFieldConfig<any, any> = {
  type: ServicesResponseType,
  args: {
    filter: { type: ServiceFilterInputType },
  },
  async resolve(parent, { filter }) {
    try {
      const { page, perPage, query, from, to } =
        await serviceFilterValidationInputSchema.parseAsync({ ...filter });
      const pageNum = page || 1;
      const perPageNum = perPage || 10;
      const skip = (pageNum - 1) * perPageNum;
      let whereClause: any = {
        deletedAt: false,
      };
      if (query) {
        whereClause.OR = [
          {
            name: {
              contains: query,
              mode: "insensitive", // case-insensitive search
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive", // case-insensitive search
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

      const services = await prisma.service.findMany({
        where: whereClause,
        skip,
        take: perPage,
      });
      const count = await prisma.service.count({
        where: whereClause,
        skip,
        take: perPage,
      });
      return {
        data: services,
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
        throw new Error(`db query error: ${error.meta?.cause} `);
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

export const SingleServiceQueryType: GraphQLFieldConfig<any, any> = {
  type: ServiceNormType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parent, args) {
    try {
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      const service = await prisma.service.findUnique({
        where: {
          id: id,
          deletedAt: false,
        },
      });
      if (!service) throw new Error(`service with id ${id} not found`);
      return service;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`db query error: ${error.meta?.cause} `);
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};
