import type { UiKey } from '../i18n/ui';

export interface SkillGroup {
  id: 'integration' | 'delivery' | 'creative';
  label: UiKey;
  skills: readonly string[];
}

/** Skills listed in PROJECT.md. No levels: they would be invented. */
export const skillGroups: readonly SkillGroup[] = [
  {
    id: 'integration',
    label: 'skills.group.integration',
    skills: ['MuleSoft', 'RabbitMQ', 'GoAnywhere'],
  },
  {
    id: 'delivery',
    label: 'skills.group.delivery',
    skills: ['Azure DevOps', 'CI/CD', 'SonarQube'],
  },
  { id: 'creative', label: 'skills.group.creative', skills: ['Game design'] },
];
