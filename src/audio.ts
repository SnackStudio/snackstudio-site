export class Sound {
  context?: AudioContext;
  enabled = false;
  async toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.context ??= new AudioContext();
      await this.context.resume();
    }
    return this.enabled;
  }
  play(
    kind: "bite" | "slice" | "peel" | "drip" | "tick" | "crack" | "jar",
    soft = false,
  ) {
    if (!this.enabled || !this.context) return;
    const a = this.context;
    const duration = kind === "slice" ? 0.16 : kind === "jar" ? 0.35 : 0.07;
    const gain = a.createGain();
    gain.connect(a.destination);
    gain.gain.setValueAtTime(soft ? 0.015 : 0.045, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + duration);
    const o = a.createOscillator();
    o.type = kind === "drip" ? "sine" : "triangle";
    o.frequency.setValueAtTime(
      {
        bite: 180,
        slice: 680,
        peel: 340,
        drip: 920,
        tick: 600,
        crack: 95,
        jar: 110,
      }[kind],
      a.currentTime,
    );
    o.frequency.exponentialRampToValueAtTime(45, a.currentTime + duration);
    o.connect(gain);
    o.start();
    o.stop(a.currentTime + duration);
  }
}
