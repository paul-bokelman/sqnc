import type { ControllerConfig } from "./utils.types";
import * as z from "zod";
import { AnyZodObject } from "zod";

type ToControllerConfig<S extends AnyZodObject, P = ControllerConfig["payload"]> = {
  params: z.infer<S>["params"];
  body: z.infer<S>["body"];
  query: z.infer<S>["query"];
  payload: P;
};

/* --------------------------------- SCHEMAS -------------------------------- */

export const schemas = {};
