/**
 * Construcción de FilterExpression de GA4 a partir de un esquema simple.
 */

import { z } from "zod";
import type { RunReportRequest } from "./ga4.js";

/** Esquema Zod del filtro simple expuesto a las tools. */
export const dimensionFilterSchema = z
  .object({
    dimension: z.string().describe("Nombre de la dimensión a filtrar. Ej: country, eventName, hostname."),
    value: z
      .string()
      .optional()
      .describe("Valor exacto a igualar (match EXACT). Usar esto O in_list."),
    in_list: z
      .array(z.string())
      .optional()
      .describe("Lista de valores; coincide si la dimensión es cualquiera de ellos."),
    match_type: z
      .enum(["EXACT", "CONTAINS", "BEGINS_WITH", "ENDS_WITH"])
      .optional()
      .describe("Tipo de match para 'value' (default EXACT)."),
    negate: z
      .boolean()
      .optional()
      .describe("Si es true, invierte el filtro (NOT). Útil para excluir demos por hostname."),
  })
  .describe(
    'Filtro opcional por dimensión. Ej: {"dimension":"eventName","value":"orderCoupon"} ' +
      'o {"dimension":"country","in_list":["Argentina","Brazil"]}.',
  );

export type DimensionFilterInput = z.infer<typeof dimensionFilterSchema>;

/** Traduce el filtro simple al FilterExpression nativo de GA4. */
export function buildDimensionFilter(
  input: DimensionFilterInput | undefined,
): RunReportRequest["dimensionFilter"] | undefined {
  if (!input?.dimension) return undefined;

  let filter: NonNullable<RunReportRequest["dimensionFilter"]>["filter"];

  if (input.in_list && input.in_list.length > 0) {
    filter = {
      fieldName: input.dimension,
      inListFilter: { values: input.in_list },
    };
  } else if (input.value !== undefined) {
    filter = {
      fieldName: input.dimension,
      stringFilter: {
        value: input.value,
        matchType: input.match_type ?? "EXACT",
      },
    };
  } else {
    return undefined;
  }

  if (input.negate) {
    return { notExpression: { filter } };
  }
  return { filter };
}
