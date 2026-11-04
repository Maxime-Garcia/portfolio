import { describe, expect, it, vi } from 'vitest';
import { timelineSchema } from '../../src/lib/schemas';
import { skillGroups } from '../../src/lib/skills';
import { submitContact } from '../../src/scripts/contact';

// timeline.yaml itself is validated against this schema by `astro build`.
describe('timelineSchema', () => {
  it('accepts a complete bilingual entry', () => {
    const ok = {
      id: 'x',
      order: 1,
      period: { fr: 'a', en: 'b' },
      title: { fr: 'a', en: 'b' },
      text: { fr: 'a', en: 'b' },
    };
    expect(timelineSchema.safeParse(ok).success).toBe(true);
  });

  it('rejects an entry missing a translation', () => {
    const bad = {
      id: 'x',
      order: 1,
      period: { fr: 'a' },
      title: { fr: 'a', en: 'b' },
      text: { fr: 'a', en: 'b' },
    };
    expect(timelineSchema.safeParse(bad).success).toBe(false);
  });

  it('defaults placeholder to false', () => {
    const entry = timelineSchema.parse({
      id: 'x',
      order: 1,
      period: { fr: 'a', en: 'b' },
      title: { fr: 'a', en: 'b' },
      text: { fr: 'a', en: 'b' },
    });
    expect(entry.placeholder).toBe(false);
  });
});

describe('skills', () => {
  it('lists the skills from the spec', () => {
    const all = skillGroups.flatMap((g) => g.skills);
    for (const skill of [
      'MuleSoft',
      'Azure DevOps',
      'CI/CD',
      'RabbitMQ',
      'GoAnywhere',
      'SonarQube',
      'Game design',
    ]) {
      expect(all).toContain(skill);
    }
  });
});

describe('submitContact', () => {
  const data = new FormData();
  data.set('email', 'a@b.c');

  it('posts JSON and reports success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(submitContact('https://formspree.io/f/x', data, fetchImpl)).resolves.toBe(
      'success',
    );
    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers.Accept).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.c' });
  });

  it('reports an error on a failed response or network error', async () => {
    const bad = vi.fn().mockResolvedValue(new Response('{}', { status: 422 }));
    await expect(submitContact('u', data, bad)).resolves.toBe('error');
    const down = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(submitContact('u', data, down)).resolves.toBe('error');
  });
});
