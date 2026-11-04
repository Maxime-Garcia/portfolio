import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { timelineSchema } from './lib/schemas';

const timeline = defineCollection({
  loader: file('src/content/timeline.yaml'),
  schema: timelineSchema,
});

export const collections = { timeline };
