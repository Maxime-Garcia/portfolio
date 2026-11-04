import { z } from 'astro/zod';

const localized = z.object({ fr: z.string().min(1), en: z.string().min(1) });

export const timelineSchema = z.object({
  id: z.string(),
  /** Display order: the file loader does not keep the YAML order. */
  order: z.number().int(),
  placeholder: z.boolean().default(false),
  period: localized,
  title: localized,
  text: localized,
});

export type TimelineEntry = z.infer<typeof timelineSchema>;
