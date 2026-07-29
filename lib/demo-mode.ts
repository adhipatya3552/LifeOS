/**
 * Mock Google tool responses are only allowed when LIFEOS_DEMO_MODE=true.
 * In production, missing tokens must fail closed — never look like real data.
 */
export function isLifeOsDemoMode() {
  return process.env.LIFEOS_DEMO_MODE === "true";
}

export function missingAccessTokenResult(serviceLabel: string) {
  return {
    success: false as const,
    mock: false as const,
    error: `No valid Google access token for ${serviceLabel}. Connect or reconnect it from /connections.`,
  };
}
