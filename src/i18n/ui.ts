export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'fr';

/** The six planets of the "Orbite" map, in scroll order. Ids are shared by both languages. */
export const sections = ['hero', 'about', 'skills', 'projects', 'passions', 'contact'] as const;

export type SectionId = (typeof sections)[number];

const fr = {
  'meta.description':
    'Portfolio de Maxime Garcia, développeur intégration chez CGI, expert MuleSoft, game designer et guitariste.',
  'site.role': 'Développeur intégration · MuleSoft',
  'skip.link': 'Aller au contenu',
  'hud.label': 'Carte stellaire',
  'hud.home': 'Retour au départ',
  'hud.theme': 'Thème clair',
  'hud.lang': 'English',
  'hud.lang.label': 'Read this page in English',
  'section.hero': 'Départ',
  'section.about': 'À propos',
  'section.skills': 'Compétences',
  'section.projects': 'Projets',
  'section.passions': 'Passions',
  'section.contact': 'Contact',
  'hero.tagline': 'Je relie les systèmes entre eux. Bienvenue à bord.',
  'section.soon': 'Planète en cours d’exploration.',
} as const;

export type UiKey = keyof typeof fr;

const en: Record<UiKey, string> = {
  'meta.description':
    'Portfolio of Maxime Garcia, integration developer at CGI, MuleSoft expert, game designer and guitarist.',
  'site.role': 'Integration developer · MuleSoft',
  'skip.link': 'Skip to content',
  'hud.label': 'Star map',
  'hud.home': 'Back to launch',
  'hud.theme': 'Light theme',
  'hud.lang': 'Français',
  'hud.lang.label': 'Lire cette page en français',
  'section.hero': 'Launch',
  'section.about': 'About',
  'section.skills': 'Skills',
  'section.projects': 'Projects',
  'section.passions': 'Passions',
  'section.contact': 'Contact',
  'hero.tagline': 'I connect systems together. Welcome aboard.',
  'section.soon': 'Planet under exploration.',
};

/** Interface strings. The `Record<UiKey, string>` type keeps FR and EN in parity. */
export const ui: Record<Lang, Record<UiKey, string>> = { fr, en };
