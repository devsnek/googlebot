module.exports = function test_raven() {
  throw new Error('hi raven does it work');
};

module.exports.owner = true;
