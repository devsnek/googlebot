const request = require('superagent');

const conditionMap = {
  'clear-night': '🌝',
  'partly-cloudly-night': '🌝',
  'rain': '🌧',
  'snow': '🌨',
  'sleet': '🌨',
  'fog': '🌫',
  'wind': '🌬',
  'cloudy': '☁'
}

module.exports = {
  main: (bot, msg, settings) => {
    const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${msg.content.split(' ').join('+')}&key=${settings.config.mapsKey}`;
    request.get(mapsUrl).end((err, res) => {
      if (err) bot.error(err);
      if (!res.body.results[0]) return msg.channel.sendMessage('`Invalid Location!`');
      let geocode = [res.body.results[0].geometry.location.lat, res.body.results[0].geometry.location.lng].join(',');
      let fullName = res.body.results[0].formatted_address;
      request.get(`https://api.darksky.net/forecast/${settings.config.forecastKey}/${geocode}?units=si`).end((err, res) => {
        if (err) bot.error(err);
        let data = res.body;
        // let localtime = data.currently.time;
        let condition = data.currently.summary;
        let icon = data.currently.icon;
        let chanceofrain = Math.round((data.currently.precipProbability * 100) / 5) * 5;
        let temperature = Math.round(data.currently.temperature * 10) / 10;
        let feelslike = Math.round(data.currently.apparentTemperature * 10) / 10;
        let humidity = Math.round(data.currently.humidity * 100);
        let windspeed = data.currently.windSpeed;
        let final = `${conditionMap[icon] ? conditionMap[icon] : ''} __${fullName}__
**Conditions**: ${condition}
**Temp**: ${temperature} °C
**Feels Like**: ${feelslike} °C
**Humidity**: ${humidity}%
**Chance of Rain**: ${chanceofrain}%
**Windspeed**: ${windspeed} `
        msg.channel.sendMessage(final);
      });
    });
  },
  help: 'Search for weather on the web',
  args: '<location>',
  catagory: 'general'
}

