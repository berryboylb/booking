import { z } from "zod";

import { isValidObjectId } from "./booking";

export const createScheduleValidationInputSchema = z
  .object({
    serviceId: z.string().refine((value) => isValidObjectId(value), {
      message: "Invalid ObjectId format for serviceId",
    }),
    startTime: z.date().refine((value) => value >= new Date(), {
      message: "startTime must be in the future",
    }),
    endTime: z.date(),
  })
  .refine(({ startTime, endTime }) => endTime > startTime, {
    message: "endTime must be after startTime",
  });

export const filterScheduleValidationInputSchema = z
  .object({
    serviceId: z
      .string()
      .refine((value) => isValidObjectId(value), {
        message: "Invalid ObjectId format",
      })
      .optional(),
    startTime: z
      .date()
      .refine((value) => value >= new Date(), {
        message: "startTime must be in the future",
      })
      .optional(),
    endTime: z.date().optional(),
    from: z.date().optional(),
    to: z.date().optional(),
    page: z.number().int().optional(),
    perPage: z.number().int().optional(),
  })
  .refine(({ startTime, endTime }) => {
    if (startTime && endTime) {
      return endTime > startTime;
    }
    return true;
  }, "endTime must be after startTime if both are provided")
  .refine(({ from, to }) => {
    if (from && to) {
      return to > from;
    } else if (to && !from) {
      return false;
    }
    return true;
  }, "to must be after from if both are provided and from must be supplied if to is supplied");

export const updateScheduleValidationInputSchema = z.object({
  id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for id",
  }),
  body: createScheduleValidationInputSchema,
});
