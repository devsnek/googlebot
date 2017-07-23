for (const method of Object.keys(console)) {
  exports[method] = function(topic, ...args) {
    console[method](new Date().toISOString(), `[${topic}]`, ...args);
  }
}
