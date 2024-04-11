import {
  GraphQLSchema,
  GraphQLObjectType,
} from "graphql";
import { ServiceQueryType, SingleServiceQueryType } from "./queries/service";
import {
  createService,
  updateService,
  deleteService,
} from "./mutations/service";
import {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from "./mutations/user";
import { getUser, getUsers } from "./queries/user";
import { getBooking, getUserBookings, getAllBookings } from "./queries/booking";
import {
  createBooking,
  updateBookingStatus,
  deleteBooking,
  updateBookingSchedule,
} from "./mutations/booking";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "./mutations/schedule";

import { getSchedules, getSingleSchedule } from "./queries/schedule";


const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getServices: ServiceQueryType,
    getSingleService: SingleServiceQueryType,
    getSchedules,
    getSingleSchedule,
    getUser,
    getUsers,
    getBooking,
    getUserBookings,
    getAllBookings,
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createService,
    updateService,
    deleteService,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    createBooking,
    updateBookingStatus,
    updateBookingSchedule,
    deleteBooking,
  },
});

export const rootSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
