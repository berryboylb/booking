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
import { BookingNormType } from "./booking";
import { DateType } from "./date";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    // password: { type: GraphQLString },
    // expiresAt: { type: DateType }, // Assuming DateTime is represented as a string
    // token: { type: DateType },
    // bookings: {
    //   type: new GraphQLList(BookingNormType),
    //   async resolve(parent, args) {
    //     return prisma.booking.findMany({
    //       where: {
    //         userId: parent.userId,
    //         deletedAt: false,
    //       },
    //     });
    //   },
    // },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    deletedAt: { type: GraphQLBoolean },
  }),
});

export const CreateUserInputType = new GraphQLInputObjectType({
  name: "CreateUserInputInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const UpdateUserInputType = new GraphQLInputObjectType({
  name: "UpdateUserInputType",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const LoginUserInputType = new GraphQLInputObjectType({
  name: "LoginUserInputType",
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const UserFilterInputType = new GraphQLInputObjectType({
  name: "UserFilterInputType",
  fields: {
    query: { type: GraphQLString },
    from: { type: DateType },
    to: { type: DateType },
    page: { type: GraphQLInt },
    perPage: { type: GraphQLInt },
  },
});
