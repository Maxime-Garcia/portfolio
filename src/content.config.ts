import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { projectSchema, timelineSchema } from './lib/schemas';

const timeline = defineCollection({
  loader: file('src/content/timeline.yaml'),
  schema: timelineSchema,
});

/** Ids look like "fr/my-project": the same file name in fr/ and en/ is the same project. */
const projects = defineCollection({
  loader: glob({ pattern: '{fr,en}/*.mdx', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { timeline, projects };
