for (const method of Object.keys(console)) {
  exports[method] = function log(topic, ...args) {
    // eslint-disable-next-line no-console
    console[method](new Date().toISOString(), `[${topic}]`, ...args);
  };
}
