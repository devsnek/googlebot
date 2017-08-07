function blocked(fn, { time = 50, interval = 100 } = {}) {
  let start = process.hrtime();
  return setInterval(() => {
    let delta = process.hrtime(start);
    let nanosec = (delta[0] * 1e9) + delta[1];
    let ms = nanosec / 1e6;
    let n = ms - interval;

    if (n > time) fn(Math.round(n));
    start = process.hrtime();
  }, interval).unref();
}

module.exports = blocked;
