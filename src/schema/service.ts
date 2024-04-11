import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from "graphql";
import { DateType } from "./date";
import { ScheduleNormType } from "./schedule";

export const ServiceType = new GraphQLObjectType({
  name: "Service",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const ServiceNormType = new GraphQLObjectType({
  name: "ServiceNorm",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    schedules: {
      type: new GraphQLList(ScheduleNormType),
      resolve(parent, args) {
        return prisma.schedule.findMany({
          where: {
            serviceId: parent.id,
          },
        });
      },
    },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const ServiceFilterInputType = new GraphQLInputObjectType({
  name: "ServiceFilterInput",
  fields: {
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    from: { type: DateType },
    to: { type: DateType },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  },
});

export const CreateServiceType = new GraphQLInputObjectType({
  name: "CreateServiceInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
  },
});
