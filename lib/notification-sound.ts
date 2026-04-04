/**
 * lib/notification-sound.ts
 *
 * Plays a pleasant two-tone chime using the Web Audio API.
 * No external audio files — the sound is synthesised in the browser.
 * Silently no-ops if the browser doesn't support Web Audio API.
 */

/**
 * Plays a gentle two-note completion chime (C5 → E5).
 * Call this when the AI finishes a response.
 */
export function playCompletionChime(): void {
  if (typeof window === "undefined") return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass: typeof AudioContext =
      window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Two ascending sine tones: C5 (523 Hz) then E5 (659 Hz)
    const notes: Array<{ freq: number; delay: number }> = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.16 },
    ];

    for (const { freq, delay } of notes) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      const startAt = ctx.currentTime + delay;

      // Fade in quickly, then tail off smoothly
      gainNode.gain.setValueAtTime(0, startAt);
      gainNode.gain.linearRampToValueAtTime(0.25, startAt + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + 0.45);

      oscillator.start(startAt);
      oscillator.stop(startAt + 0.46);
    }

    // Close the audio context shortly after the chime finishes to free resources
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch {
    // Web Audio API unavailable or blocked — fail silently
  }
}
