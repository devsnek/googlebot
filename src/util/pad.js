module.exports = {
  right: (v, n, c = ' ') => String(v).length >= n ? `${v}` : String(v) + String(c).repeat(n - String(v).length),
  left: (v, n, c = ' ') => String(v).length >= n ? `${v}` : (String(c).repeat(n) + v).slice(-n),
};
