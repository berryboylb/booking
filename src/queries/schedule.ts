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
import { ScheduleType, ScheduleFilterInputType } from "../schema/schedule";
import prisma from "../prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { filterScheduleValidationInputSchema } from "../validator/schdule";
import { idValidationSchema } from "../validator/booking";

const SchedulesResponseType = new GraphQLObjectType({
  name: "SchedulesResponse",
  fields: () => ({
    data: { type: new GraphQLList(ScheduleType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  }),
});

export const getSchedules: GraphQLFieldConfig<any, any> = {
  type: SchedulesResponseType,
  args: {
    filter: { type: ScheduleFilterInputType },
  },
  async resolve(parent, { filter }) {
    try {
      const { page, perPage, from, to, serviceId, startTime, endTime } =
        await filterScheduleValidationInputSchema.parseAsync({ ...filter });
      const pageNum = page || 1;
      const perPageNum = perPage || 10;
      const skip = (pageNum - 1) * perPageNum;
      let whereClause: any = {};

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

      if (serviceId) {
        whereClause = {
          ...whereClause,
          serviceId: serviceId,
        };
      }

      if (startTime && endTime) {
        whereClause = {
          ...whereClause,
          AND: [
            {
              startTime: {
                gte: new Date(startTime),
              },
            },
            {
              endTime: {
                lte: new Date(endTime),
              },
            },
          ],
        };
      }


      const schedules = await prisma.schedule.findMany({
        where: whereClause,
        skip,
        take: perPageNum,
      });
      const count = await prisma.schedule.count({
        where: whereClause,
        skip,
        take: perPageNum,
      });

      return {
        data: schedules,
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

export const getSingleSchedule: GraphQLFieldConfig<any, any> = {
  type: ScheduleType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parent, args) {
    try {
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      const service = await prisma.schedule.findUnique({
        where: {
          id,
        },
      });
      if (!service) throw new Error(`schedule with id ${id} not found`);
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
