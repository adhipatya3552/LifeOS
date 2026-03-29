export function isConfiguredConvexUrl(url: string | undefined | null) {
  return Boolean(url && !url.includes("your-project"));
}
