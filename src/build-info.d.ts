declare const __BUILD_COMMIT__: string
declare const __BUILD_DATE__: string

/** The newest Tilde release, looked up when the site builds (scripts/tilde-release.mjs), or null. */
declare const __TILDE_RELEASE__: { version: string; apk: string; bytes: number } | null
