import { z } from "zod";
import { isValidObjectId } from "./booking";

export const serviceFilterValidationInputSchema = z
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


export const createServiceSchema = z.object({
  name: z.string().min(3).toLowerCase(),
  description: z.string().min(3).toLowerCase(),
});

export const updateServiceSchema = z.object({
  id: z.string().refine((value) => isValidObjectId(value), {
    message: "Invalid ObjectId format",
  }),
  body: createServiceSchema,
});