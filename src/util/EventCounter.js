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
}

module.exports = EventCounter;
