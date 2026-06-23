/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_KEY: string;
  readonly VITE_TALLY_FORM_ID?: string;
  readonly VITE_WAITLIST_COUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
