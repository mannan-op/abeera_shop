/** Public routes show the coming soon page unless this is exactly "false". */
export function isComingSoon() {
  return process.env.COMING_SOON !== "false";
}
