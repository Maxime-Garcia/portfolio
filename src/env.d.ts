interface ImportMetaEnv {
  /** Formspree form id (the part after /f/). Without it, the contact form is disabled. */
  readonly PUBLIC_FORMSPREE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
