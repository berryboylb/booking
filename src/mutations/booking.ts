import {
  GraphQLID,
  GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from "graphql";
import { BookingInputType, BookingType } from "../schema/booking";
import prisma from "../prisma";
import { authenticateToken } from "../middleware/auth";
import {
  bookingValidationSchema,
  bookingStatusValidationSchema,
  idValidationSchema,
  scheduleValidationSchema,
} from "../validator/booking";
import { z } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const createBooking: GraphQLFieldConfig<any, any> = {
  type: BookingType,
  args: {
    body: { type: new GraphQLNonNull(BookingInputType) },
  },
  async resolve(parent, { body }, context, info) {
    try {
      const { id: userId } = await authenticateToken(context);
      const { status, serviceId, scheduleId } =
        await bookingValidationSchema.parseAsync(body);

      const [service, schedule] = await Promise.all([
        prisma.service.findUnique({
          where: { id: serviceId, deletedAt: false },
        }),
        prisma.schedule.findUnique({
          where: { id: scheduleId },
        }),
      ]);
      if (!service) {
        throw new Error(`Service with id ${serviceId} does not exist`);
      }
      if (!schedule) {
        throw new Error(`Schedule with id ${scheduleId} does not exist`);
      }

      const existingBooking = await prisma.booking.findFirst({
        where: {
          scheduleId,
          serviceId,
          status: { not: "cancelled" },
          deletedAt: false,
        },
      });
      if (existingBooking) {
        throw new Error(`Schedule with id ${scheduleId} is already booked for service with id ${serviceId}`);
      }

      const booking = await prisma.booking.create({
        data: {
          userId,
          status,
          serviceId,
          scheduleId,
        },
      });

      return booking;
    } catch (error) {
      console.error({ error });
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error("Error fetching from database: " + error.message);
      } else {
        throw error;
      }
    }
  },
};

export const updateBookingStatus: GraphQLFieldConfig<any, any> = {
  type: BookingType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, args, context, info) {
    try {
      const { id: userId } = await authenticateToken(context);
      const { status, id } = await bookingStatusValidationSchema.parseAsync({
        status: args.status,
        id: args.id,
      });
      const booking = await prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if (!booking) {
        throw new Error(`Booking with the id ${id} not found`);
      }

      if (booking.userId !== userId) {
        throw new Error(
          "Unauthorized: You are not authorized to update this booking"
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: {
          id,
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      return updatedBooking;
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

export const updateBookingSchedule: GraphQLFieldConfig<any, any> = {
  type: BookingType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    scheduleId: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parent, args, context, info) {
    try {
      const { id: userId } = await authenticateToken(context);
      const { id, scheduleId } = await scheduleValidationSchema.parseAsync(
        args
      );

      const [booking, schedule, isScheduleBooked] = await Promise.all([
        prisma.booking.findUnique({
          where: {
            id,
          },
        }),
        prisma.schedule.findUnique({
          where: {
            id: scheduleId,
          },
        }),
        prisma.booking.findFirst({
          where: {
            scheduleId,
            status: { not: "cancelled" },
            deletedAt: false,
            id: { not: id },
          },
        }),
      ]);

      if (!booking) {
        throw new Error(`Booking with the id ${id} not found`);
      }
      if (!schedule) {
        throw new Error(`Schedule with the id ${schedule} not found`);
      }

      if (booking.userId !== userId) {
        throw new Error(
          "Unauthorized: You are not authorized to update this booking"
        );
      }

      if (isScheduleBooked) {
        throw new Error(`Schedule with id ${scheduleId} is already booked`);
      }

      const updatedBooking = await prisma.booking.update({
        where: {
          id,
        },
        data: {
          scheduleId,
          updatedAt: new Date(),
        },
      });

      return updatedBooking;
    } catch (error) {
      console.error({ error });
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

export const deleteBooking: GraphQLFieldConfig<any, any> = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parent, args, context, info) {
    try {
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      const { id: userId } = await authenticateToken(context);

      const booking = await prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if (!booking) {
        throw new Error(`Booking with the id ${id} not found`);
      }

      if (booking.userId !== userId) {
        throw new Error(
          "Unauthorized: You are not authorized to delete this booking"
        );
      }

      // Update the booking's deletedAt field
      await prisma.booking.update({
        where: {
          id,
          deletedAt: false,
        },
        data: {
          deletedAt: true,
        },
      });
      return true;
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
