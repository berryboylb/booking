import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLNonNull,
} from "graphql";
import { ScheduleType, ScheduleInputType } from "../schema/schedule";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createScheduleValidationInputSchema,
  updateScheduleValidationInputSchema,
} from "../validator/schdule";
import { idValidationSchema } from "../validator/booking";

export const createSchedule: GraphQLFieldConfig<any, any> = {
  type: ScheduleType,
  args: {
    body: { type: new GraphQLNonNull(ScheduleInputType) },
  },
  async resolve(parent, { body }, context, info) {
    try {
      const { startTime, endTime, serviceId } =
        await createScheduleValidationInputSchema.parseAsync(body);

      const [service, existingSchedule] = await Promise.all([
        prisma.service.findUnique({
          where: { id: serviceId, deletedAt: false },
        }),
        prisma.schedule.findFirst({
          where: {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
              { serviceId: { equals: serviceId } },
            ],
          },
        }),
      ]);

      if (!service) {
        throw new Error(`Service with the serviceId ${serviceId} not found`);
      }

      if (existingSchedule) {
        throw new Error(
          `A schedule within startTime ${startTime} and endTime ${endTime} already exists for serviceId ${serviceId}`
        );
      }

      // Create the schedule
      const schedule = await prisma.schedule.create({
        data: {
          serviceId,
          startTime,
          endTime,
        },
      });

      return schedule;
    } catch (error) {
      console.log({ error });
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

export const updateSchedule: GraphQLFieldConfig<any, any> = {
  type: ScheduleType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    body: { type: new GraphQLNonNull(ScheduleInputType) },
  },
  async resolve(parent, args) {
    try {
      const { id, body } = await updateScheduleValidationInputSchema.parseAsync(
        args
      );
      const existing = await prisma.schedule.findFirst({
        where: {
          AND: [
            { startTime: { gte: new Date(body.startTime) } },
            { endTime: { lte: new Date(body.endTime) } },
            { serviceId: { equals: body.serviceId } },
            { id: { not: id } },
          ],
        },
      });
      if (existing) {
        throw new Error(
          `A schedule within startTime ${body.startTime} and endTime ${body.endTime} already exists for serviceId ${body.serviceId}`
        );
      }
      const schedule = await prisma.schedule.update({
        where: {
          id: id,
        },
        data: {
          ...body,
          updatedAt: new Date(),
        },
      });
      return schedule;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          "Service with this name already exists." + error.message
        );
      } else {
        throw error;
      }
    }
  },
};

export const deleteSchedule: GraphQLFieldConfig<any, any> = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  async resolve(parent, args) {
    try {
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      await prisma.schedule.delete({
        where: {
          id,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`db query error: ${error.meta?.cause} `);
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error(`db connection error: ${error.message}` );
      } else {
        throw error;
      }
    }
  },
};
