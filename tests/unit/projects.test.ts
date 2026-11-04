import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProjectId, projectPath, sortProjects, usedTags } from '../../src/lib/projects';
import { projectSchema, projectTags } from '../../src/lib/schemas';
import { formatCount, matchesFilter } from '../../src/scripts/filters';

const valid = {
  title: 'A',
  summary: 'B',
  year: 2026,
  tags: ['integration'],
  stack: ['MuleSoft'],
};

describe('projectSchema', () => {
  it('accepts a minimal project and applies defaults', () => {
    const data = projectSchema.parse(valid);
    expect(data.placeholder).toBe(false);
    expect(data.links).toEqual({});
  });

  it('rejects unknown tags, empty stacks and invalid links', () => {
    expect(projectSchema.safeParse({ ...valid, tags: ['cooking'] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, tags: [] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, stack: [] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, links: { repo: 'not a url' } }).success).toBe(false);
  });
});

describe('project files', () => {
  const list = (lang: string) => readdirSync(`src/content/projects/${lang}`).sort();

  it('exist in both languages with the same file names', () => {
    expect(list('fr').length).toBeGreaterThan(0);
    expect(list('en')).toEqual(list('fr'));
  });

  it('lists the example projects still to replace', () => {
    const examples = list('fr').filter((name) => name.startsWith('exemple-'));
    // Fails on purpose once real projects exist: then drop the examples and this test.
    expect(examples).toEqual([
      'exemple-jeu-orbite.mdx',
      'exemple-passerelle-api.mdx',
      'exemple-pipeline-qualite.mdx',
    ]);
  });
});

describe('project helpers', () => {
  it('parses ids and builds localized paths', () => {
    expect(parseProjectId('en/a-b')).toEqual({ lang: 'en', slug: 'a-b' });
    expect(() => parseProjectId('de/x')).toThrow();
    expect(() => parseProjectId('fr')).toThrow();
    expect(projectPath('fr', 'a')).toBe('/projects/a/');
    expect(projectPath('en', 'a')).toBe('/en/projects/a/');
  });

  it('sorts by year then title', () => {
    const items = [
      { data: { year: 2024, title: 'Z' } },
      { data: { year: 2026, title: 'B' } },
      { data: { year: 2026, title: 'A' } },
    ];
    expect(sortProjects(items).map((i) => i.data.title)).toEqual(['A', 'B', 'Z']);
  });

  it('keeps only used tags, in canonical order', () => {
    const items = [
      { data: { tags: ['game', 'web'] as const } },
      { data: { tags: ['integration'] as const } },
    ];
    expect(usedTags(items, projectTags)).toEqual(['integration', 'web', 'game']);
  });
});

describe('filters', () => {
  it('matches all or the active tag', () => {
    expect(matchesFilter(['web'], 'all')).toBe(true);
    expect(matchesFilter(['web', 'game'], 'game')).toBe(true);
    expect(matchesFilter(['devops'], 'game')).toBe(false);
  });

  it('formats the live count', () => {
    expect(formatCount('{count} projet(s) affiché(s)', 2)).toBe('2 projet(s) affiché(s)');
  });
});
