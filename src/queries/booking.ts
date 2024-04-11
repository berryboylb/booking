import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfig,
  GraphQLNonNull,
} from "graphql";
import {
  BookingType,
  BookingFilterInputType,
  AllBookingType,
  AllBookingFilterInputType,
} from "../schema/booking";
import {
  idValidationSchema,
  bookingFilterValidationInputSchema,
  allBookingFilterValidationInputSchema,
} from "../validator/booking";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authenticateToken } from "../middleware/auth";

export const getBooking: GraphQLFieldConfig<any, any> = {
  type: BookingType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, args, context, info) {
    try {
      const { id: userId } = await authenticateToken(context);
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      const booking = await prisma.booking.findUnique({
        where: {
          id,
        },
      });
      if (!booking) throw new Error(`booking with the id ${id} not found`);
      if (booking.userId !== userId)
        throw new Error(
          "Unauthorized: You are not authorized to view this booking"
        );
      return booking;
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

const BookingsResponseType = new GraphQLObjectType({
  name: "BookingsReSponse",
  fields: () => ({
    data: { type: new GraphQLList(BookingType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  }),
});

export const getUserBookings: GraphQLFieldConfig<any, any> = {
  type: BookingsResponseType,
  args: {
    filter: { type: BookingFilterInputType },
  },
  async resolve(parent, { filter }, context, info) {
    try {
      const { page, perPage, status, serviceId, from, to } =
        await bookingFilterValidationInputSchema.parseAsync({ ...filter });
      const { id: userId } = await authenticateToken(context);
      const pageNum = page || 1;
      const perPageNum = perPage || 10;
      const skip = (pageNum - 1) * perPageNum;
      let whereClause: any = {
        deletedAt: false,
        userId,
      };
      if (status) {
        whereClause = {
          ...whereClause,
          status,
        };
      }
      if (serviceId) {
        whereClause = {
          ...whereClause,
          serviceId,
        };
      }
      if (from && to) {
        whereClause = {
          ...whereClause,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        };
      }
      if (from) {
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
      const bookings = await prisma.booking.findMany(obj);
      const count = await prisma.booking.count(obj);
      return {
        data: bookings,
        page: pageNum,
        perPage: perPageNum,
        total: count,
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
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

const AllBookingsResponseType = new GraphQLObjectType({
  name: "AllBookingsResponseType",
  fields: () => ({
    data: { type: new GraphQLList(AllBookingType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  }),
});

export const getAllBookings: GraphQLFieldConfig<any, any> = {
  type: AllBookingsResponseType,
  args: {
    filter: { type: AllBookingFilterInputType },
  },
  async resolve(parent, { filter }, context, info) {
    try {
      await authenticateToken(context);
      const { page, perPage, status, serviceId, from, to, userId } =
        await allBookingFilterValidationInputSchema.parseAsync({ ...filter });
      const pageNum = page || 1;
      const perPageNum = perPage || 10;
      const skip = (pageNum - 1) * perPageNum;
      let whereClause: any = {
        deletedAt: false,
      };
      if (status) {
        whereClause = {
          ...whereClause,
          status,
        };
      }
      if (serviceId) {
        whereClause = {
          ...whereClause,
          serviceId,
        };
      }
      if (userId) {
        whereClause = {
          ...whereClause,
          userId,
        };
      }
      if (from && to) {
        whereClause = {
          ...whereClause,
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        };
      }
      if (from) {
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
      const bookings = await prisma.booking.findMany(obj);
      const count = await prisma.booking.count(obj);
      return {
        data: bookings,
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
