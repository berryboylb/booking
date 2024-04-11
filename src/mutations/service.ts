import {
  GraphQLID,
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLNonNull,
} from "graphql";
import { ServiceType, CreateServiceType } from "../schema/service";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createServiceSchema, updateServiceSchema } from "../validator/service";
import { idValidationSchema } from "../validator/booking";

export const createService: GraphQLFieldConfig<any, any> = {
  type: ServiceType,
  args: {
    body: { type: new GraphQLNonNull(CreateServiceType) },
  },
  async resolve(parent, { body }) {
    try {
      const req = await createServiceSchema.parseAsync(body);
      const service = await prisma.service.create({
        data: {
          ...req,
        },
      });
      return service;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Service with this name already exists.");
      } else {
        throw error;
      }
    }
  },
};

export const updateService: GraphQLFieldConfig<any, any> = {
  type: ServiceType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    body: { type: new GraphQLNonNull(CreateServiceType) },
  },
  async resolve(parent, args) {
    try {
      const { id, body } = await updateServiceSchema.parseAsync(args);
      const service = await prisma.service.update({
        where: {
          id: id,
          deletedAt: false,
        },
        data: {
          ...body,
          updatedAt: new Date(),
        },
      });
      return service;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid input data: " +
            error.errors.map((err) => err.message).join("\n")
        );
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw new Error(
              `Service with this name ${args.body.name} already exists`
            );
          case "P2025":
            throw new Error(`db query error: ${error.meta?.cause} `);
          default:
            throw new Error(`unknown client error: ${error.message}`);
        }
      } else if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

export const deleteService: GraphQLFieldConfig<any, any> = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  async resolve(parent, args) {
    try {
      const { id } = await idValidationSchema.parseAsync({ id: args.id });
      await prisma.service.update({
        where: { id, deletedAt: false },
        data: { deletedAt: true },
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
        throw new Error(`db connection error: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};
