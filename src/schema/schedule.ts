import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { DateType } from "./date";
import prisma from "../prisma";
import { ServiceType } from "./service";

export const ScheduleNormType = new GraphQLObjectType({
  name: "ScheduleNorm",
  fields: () => ({
    id: { type: GraphQLID },
    startTime: { type: DateType },
    endTime: { type: DateType },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  }),
});

export const ScheduleType = new GraphQLObjectType({
  name: "Schedule",
  fields: () => ({
    id: { type: GraphQLID },
    // serviceId: { type: GraphQLID },
    service: {
      type: ServiceType,
      async resolve(parent, args) {
        return prisma.service.findUnique({
          where: { id: parent.serviceId, deletedAt: false },
        });
      },
    },
    startTime: { type: DateType },
    endTime: { type: DateType },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  }),
});

export const ScheduleInputType = new GraphQLInputObjectType({
  name: "ScheduleInputType",
  fields: {
    startTime: { type: new GraphQLNonNull(DateType) },
    endTime: { type: new GraphQLNonNull(DateType) },
    serviceId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const ScheduleFilterInputType = new GraphQLInputObjectType({
  name: "ScheduleFilterInput",
  fields: {
    serviceId: { type: GraphQLID },
    startTime: { type: DateType },
    endTime: { type: DateType },
    from: { type: DateType },
    to: { type: DateType },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  },
});
