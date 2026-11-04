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
  'placeholder.badge': 'Exemple',
  'placeholder.todo': 'À compléter',

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
  'section.soon': 'Planète en cours d’exploration.',

  'hero.tagline': 'Je relie les systèmes entre eux. Bienvenue à bord.',
  'hero.cta.projects': 'Voir mes projets',
  'hero.cta.contact': 'Me contacter',

  'about.lead':
    'Passionné de technologie depuis l’enfance, je suis aujourd’hui développeur intégration chez CGI, spécialisé MuleSoft.',
  'about.body':
    'Mon métier : faire dialoguer des systèmes qui ne se connaissaient pas (API, files de messages, transferts de fichiers), de façon fiable et observable. Polyvalent, je touche aussi bien au code qu’à la chaîne qui le livre. En dehors du travail, je conçois des jeux et je joue de la guitare.',
  'about.photo': 'Photo de Maxime Garcia (provisoire)',
  'about.timeline': 'Parcours',

  'skills.lead': 'Les outils avec lesquels je construis des ponts entre les systèmes.',
  'skills.group.integration': 'Intégration',
  'skills.group.delivery': 'Livraison et qualité',
  'skills.group.creative': 'Création',

  'passions.lead': 'Ce qui m’anime quand l’écran de travail s’éteint.',
  'passions.music.title': 'Guitare',
  'passions.music.body':
    'La guitare, c’est mon autre langage. Ici, un morceau de démonstration synthétisé, en attendant mes propres enregistrements.',
  'passions.music.track': 'Arpèges de démonstration (synthèse, provisoire)',
  'passions.music.fallback': 'Votre navigateur ne lit pas l’audio.',
  'passions.music.download': 'Télécharger le morceau',
  'passions.games.title': 'Jeux vidéo et game design',
  'passions.games.body':
    'Joueur depuis toujours, je conçois aussi des jeux : mécaniques, rythme, sensations. Ce site en est un petit : explorez-le.',
  'passions.games.list': 'Jeux qui m’ont marqué',

  'contact.lead': 'Un projet d’intégration, une idée de jeu, un riff à partager ? Écrivez-moi.',
  'contact.name': 'Nom',
  'contact.email': 'E-mail',
  'contact.message': 'Message',
  'contact.submit': 'Envoyer',
  'contact.sending': 'Envoi en cours…',
  'contact.success': 'Message envoyé. Merci, je vous réponds vite.',
  'contact.error': 'L’envoi a échoué. Réessayez, ou écrivez-moi via GitHub.',
  'contact.disabled':
    'Le formulaire sera activé très bientôt. En attendant, retrouvez-moi via les liens ci-dessous.',
  'contact.links': 'Ailleurs dans la galaxie',
  'contact.linkedin.soon': 'LinkedIn (bientôt)',
} as const;

export type UiKey = keyof typeof fr;

const en: Record<UiKey, string> = {
  'meta.description':
    'Portfolio of Maxime Garcia, integration developer at CGI, MuleSoft expert, game designer and guitarist.',
  'site.role': 'Integration developer · MuleSoft',
  'skip.link': 'Skip to content',
  'placeholder.badge': 'Example',
  'placeholder.todo': 'To be completed',

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
  'section.soon': 'Planet under exploration.',

  'hero.tagline': 'I connect systems together. Welcome aboard.',
  'hero.cta.projects': 'See my projects',
  'hero.cta.contact': 'Contact me',

  'about.lead':
    'Into technology since childhood, I am now an integration developer at CGI, specialised in MuleSoft.',
  'about.body':
    'My job: getting systems that never met to talk to each other (APIs, message queues, file transfers), reliably and observably. A generalist, I work on the code as much as on the pipeline that ships it. Outside work, I design games and play the guitar.',
  'about.photo': 'Photo of Maxime Garcia (placeholder)',
  'about.timeline': 'Journey',

  'skills.lead': 'The tools I use to build bridges between systems.',
  'skills.group.integration': 'Integration',
  'skills.group.delivery': 'Delivery and quality',
  'skills.group.creative': 'Creative',

  'passions.lead': 'What drives me once the work screen goes dark.',
  'passions.music.title': 'Guitar',
  'passions.music.body':
    'The guitar is my other language. Here is a synthesised demo track, until my own recordings land.',
  'passions.music.track': 'Demo arpeggios (synthesised, placeholder)',
  'passions.music.fallback': 'Your browser cannot play audio.',
  'passions.music.download': 'Download the track',
  'passions.games.title': 'Video games and game design',
  'passions.games.body':
    'A lifelong player, I also design games: mechanics, pacing, feel. This site is a small one: explore it.',
  'passions.games.list': 'Games that shaped me',

  'contact.lead': 'An integration project, a game idea, a riff to share? Write to me.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.submit': 'Send',
  'contact.sending': 'Sending…',
  'contact.success': 'Message sent. Thank you, I will reply soon.',
  'contact.error': 'Sending failed. Try again, or reach me on GitHub.',
  'contact.disabled':
    'The form will be live very soon. Meanwhile, find me through the links below.',
  'contact.links': 'Elsewhere in the galaxy',
  'contact.linkedin.soon': 'LinkedIn (soon)',
};

/** Interface strings. The `Record<UiKey, string>` type keeps FR and EN in parity. */
export const ui: Record<Lang, Record<UiKey, string>> = { fr, en };
