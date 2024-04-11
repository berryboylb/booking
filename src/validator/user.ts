import { z } from "zod";

export const userValidationSchema = z.object({
  name: z.string().min(3).toLowerCase(),
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "password must be at least 8 characters" })
    .max(50, {
      message: "The password can't accept more than 50 characters",
    }),
});


export const loginValidationSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "password must be at least 8 characters" })
    .max(50, {
      message: "The password can't accept more than 50 characters",
    }),
});

export const updateUserValidationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().trim(),
});


export const userFilterValidationInputSchema = z
  .object({
    query: z.string().min(3).toLowerCase().optional(),
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