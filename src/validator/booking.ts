import { z } from "zod";

const enumValues = ["completed", "ongoing", "cancelled", "pending"] as const;

export const isValidObjectId = (value: string): boolean => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};

export const bookingValidationSchema = z.object({
  status: z.enum(enumValues),
  serviceId: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for serviceId",
  }),
  scheduleId: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for serviceId",
  }),
});

export const bookingStatusValidationSchema = z.object({
  id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for id",
  }),
  status: z.enum(enumValues),
});

export const idValidationSchema = z.object({
  id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for id",
  }),
});

export const scheduleValidationSchema = z.object({
  id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for id",
  }),
  scheduleId: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format for scheduleId ",
  }),
});

export const bookingFilterValidationInputSchema = z
  .object({
    status: z.enum(enumValues).optional(),
    serviceId: z
      .string()
      .refine((value) => isValidObjectId(value), {
        message: "Invalid ObjectId format",
      })
      .optional(),
    from: z.date().optional(),
    to: z.date().optional(),
    page: z.number().int().optional(),
    perPage: z.number().int().optional(),
  })
  .refine(({ from, to }) => {
    if (from && to) {
      return to > from;
    } else if (to && !from) {
      return false;
    }
    return true;
  }, "to must be after from if both are provided and from must be supplied if to is supplied");;

export const allBookingFilterValidationInputSchema = z.object({
  status: z.enum(enumValues).optional(),
  serviceId: z
    .string()
    .refine((value) => isValidObjectId(value), {
      message: "Invalid ObjectId format for serviceId",
    })
    .optional(),
  userId: z
    .string()
    .refine((value) => isValidObjectId(value), {
      message: "Invalid ObjectId format for userId",
    })
    .optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  page: z.number().int().optional(),
  perPage: z.number().int().optional(),
});
