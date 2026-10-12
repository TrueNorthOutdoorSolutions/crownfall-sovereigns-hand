/**
 * DEVELOPER TOOLING SWITCH (same rule as Crownfall's src/devtools.ts): on in development builds (`npm run dev`),
 * off in production builds unless built with VITE_DEV_TOOLS=true (internal test builds). Players never see the
 * Developer section of Settings.
 */
export const DEV_TOOLS: boolean = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === 'true';
