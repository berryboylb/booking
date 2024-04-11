import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from "graphql";
import { ServiceType } from "./service";
import { UserType } from "./user";
import { ScheduleNormType } from "./schedule";
import prisma from "../prisma";
import { DateType } from "./date";

export const BookingNormType = new GraphQLObjectType({
  name: "BookingNorm",
  fields: () => ({
    id: { type: GraphQLID },
    serviceId: { type: GraphQLID },
    scheduleId: { type: GraphQLID },
    // userId: { type: GraphQLID },
    status: { type: GraphQLString },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const BookingType = new GraphQLObjectType({
  name: "Booking",
  fields: () => ({
    id: { type: GraphQLID },
    service: {
      type: ServiceType,
      async resolve(parent, args) {
        return prisma.service.findUnique({
          where: { id: parent.serviceId, deletedAt: false },
        });
      },
    },
    schedule: {
      type: ScheduleNormType,
      async resolve(parent, args) {
        return prisma.schedule.findUnique({
          where: { id: parent.scheduleId },
        });
      },
    },
    status: { type: GraphQLString },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const AllBookingType = new GraphQLObjectType({
  name: "AllBooking",
  fields: () => ({
    id: { type: GraphQLID },
    // serviceId: { type: GraphQLID },
    user: {
      type: UserType,
      resolve(parent, args) {
        return prisma.user.findUnique({
          where: { id: parent.userId },
        });
      },
    },
    // userId: { type: GraphQLID },
    service: {
      type: ServiceType,
      async resolve(parent, args) {
        return prisma.service.findUnique({
          where: { id: parent.serviceId, deletedAt: false },
        });
      },
    },
    schedule: {
      type: ScheduleNormType,
      async resolve(parent, args) {
        return prisma.schedule.findUnique({
          where: { id: parent.scheduleId },
        });
      },
    },
    status: { type: GraphQLString },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const BookingInputType = new GraphQLInputObjectType({
  name: "BookingInputType",
  fields: {
    status: { type: new GraphQLNonNull(GraphQLString) },
    serviceId: { type: new GraphQLNonNull(GraphQLID) },
    scheduleId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const BookingFilterInputType = new GraphQLInputObjectType({
  name: "BookingFilterInput",
  fields: {
    status: { type: GraphQLString },
    serviceId: { type: GraphQLID },
    from: { type: DateType },
    to: { type: DateType },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  },
});

export const AllBookingFilterInputType = new GraphQLInputObjectType({
  name: "AllBookingFilterInput",
  fields: {
    status: { type: GraphQLString },
    serviceId: { type: GraphQLID },
    userId: { type: GraphQLID },
    from: { type: DateType },
    to: { type: DateType },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  },
});
