class EventCounter {
  constructor() {
    this.reset();
  }

  reset() {
    this.events = {};
    this.frequency = 0;
    this.total = 0;
    this.start = null;
  }

  trigger(event) {
    if (!this.events[event]) this.events[event] = 0;
    this.events[event]++;

    if (!this.start) this.start = new Date();
    this.frequency = ++this.total / (new Date() - this.start) * 1000;
  }

  inspect() {
    if (Object.keys(this.events).length <= 1) return `EventCounter ${this.events}`;
    const entries = Object.entries(this.events);
    const ops = entries.filter((e) => e[0].startsWith('OP')).sort((a, b) => b[1] - a[1]);
    const events = entries.filter((e) => !e[0].startsWith('OP')).sort((a, b) => b[1] - a[1]);
    return `EventCounter {
  Frequency => ${this.frequency.toLocaleString()} events/sec,
  Total => ${this.total.toLocaleString()} events,
  Start => ${this.start.toUTCString()},
  //  OPs  //
  ${ops.map(([k, v]) => `${k} => ${v.toLocaleString()}`).join(',\n  ')}
  // Events //
  ${events.map(([k, v]) => `${k} => ${v.toLocaleString()}`).join(',\n  ')}
}`;
  }
}

module.exports = EventCounter;
