import type { UiKey } from '../i18n/ui';

/**
 * How a skill is drawn:
 * - `brand`: a Simple Icons logo (CC0), by export name;
 * - `glyph`: an original pictogram for generic skills;
 * - `mono`: a monogram, for brands without a freely usable logo.
 */
export type SkillIcon =
  | { kind: 'brand'; id: string }
  | { kind: 'glyph'; id: 'weave' | 'database' | 'loop' | 'dice' | 'map' | 'pad' | 'lens' }
  | { kind: 'mono'; text: string };

export interface Skill {
  /** Display name; a UiKey when it is translated. */
  name: string | { key: UiKey };
  icon: SkillIcon;
}

export interface SkillGroup {
  id: 'connect' | 'code' | 'ship' | 'invent' | 'understand';
  label: UiKey;
  skills: readonly Skill[];
}

const brand = (name: string, id: string): Skill => ({ name, icon: { kind: 'brand', id } });
const mono = (name: string, text: string): Skill => ({ name, icon: { kind: 'mono', text } });

/** Skills as listed by Maxime. No levels: they would be invented. */
export const skillGroups: readonly SkillGroup[] = [
  {
    id: 'connect',
    label: 'skills.group.integration',
    skills: [
      mono('MuleSoft', 'Mu'),
      { name: 'DataWeave', icon: { kind: 'glyph', id: 'weave' } },
      brand('RabbitMQ', 'siRabbitmq'),
      mono('GoAnywhere', 'GA'),
      mono('Salesforce', 'Sf'),
      brand('Snowflake', 'siSnowflake'),
      { name: 'SQL', icon: { kind: 'glyph', id: 'database' } },
    ],
  },
  {
    id: 'code',
    label: 'skills.group.code',
    skills: [
      brand('JavaScript', 'siJavascript'),
      mono('AngularJS', 'Ng'),
      brand('Python', 'siPython'),
      brand('Git', 'siGit'),
      brand('GitHub', 'siGithub'),
      brand('GitLab', 'siGitlab'),
    ],
  },
  {
    id: 'ship',
    label: 'skills.group.delivery',
    skills: [
      mono('Azure DevOps', 'Az'),
      { name: 'CI/CD', icon: { kind: 'glyph', id: 'loop' } },
      brand('SonarQube', 'siSonarqubeserver'),
      brand('Jira', 'siJira'),
      mono('Tuleap', 'Tu'),
      mono('Smartsheet', 'Ss'),
      mono('Everbridge', 'Eb'),
      mono('Tableau', 'Tb'),
    ],
  },
  {
    id: 'invent',
    label: 'skills.group.creative',
    skills: [
      { name: 'Game design', icon: { kind: 'glyph', id: 'dice' } },
      { name: 'Level design', icon: { kind: 'glyph', id: 'map' } },
      { name: { key: 'skills.gamedev' }, icon: { kind: 'glyph', id: 'pad' } },
      brand('Unreal Engine', 'siUnrealengine'),
      brand('Unity', 'siUnity'),
      mono('Phaser', 'Ph'),
    ],
  },
  {
    id: 'understand',
    label: 'skills.group.understand',
    skills: [{ name: { key: 'skills.analysis' }, icon: { kind: 'glyph', id: 'lens' } }],
  },
];

/** Plain skill names (for the terminal and tests), in a given language. */
export function skillNames(group: SkillGroup, t: (key: UiKey) => string): string[] {
  return group.skills.map((skill) =>
    typeof skill.name === 'string' ? skill.name : t(skill.name.key),
  );
}
