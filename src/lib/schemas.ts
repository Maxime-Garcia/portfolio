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

export const projectTags = ['integration', 'devops', 'web', 'game', 'music'] as const;

export type ProjectTag = (typeof projectTags)[number];

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(220),
  year: z.number().int().min(2000).max(2100),
  tags: z.array(z.enum(projectTags)).min(1),
  stack: z.array(z.string().min(1)).min(1),
  links: z.object({ repo: z.url().optional(), demo: z.url().optional() }).default({}),
  /** Shows a "Play" button opening the Gravité mini-game. */
  playable: z.boolean().default(false),
  /** Example project: shows an "Example" badge until Maxime adds real ones. */
  placeholder: z.boolean().default(false),
});

export type ProjectData = z.infer<typeof projectSchema>;
