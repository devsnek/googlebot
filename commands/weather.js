const superagent = require('superagent');

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
  main: async message => {
    if (!message.content) return message.channel.send('`Invalid Location!`');
    const client = message.client;
    const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${message.content.split(' ').join('+')}&key=${client.config.google.mapsKey}`;
    let res = await superagent.get(mapsUrl);
    if (!res.body.results[0]) return message.channel.send('`Invalid Location!`');
    const geocode = [res.body.results[0].geometry.location.lat, res.body.results[0].geometry.location.lng].join(',');
    const fullName = res.body.results[0].formatted_address;
    res = await superagent.get(`https://api.darksky.net/forecast/${client.config.weather.forecastKey}/${geocode}?units=si`);
    const data = res.body;
    const condition = data.currently.summary;
    const icon = data.currently.icon;
    const chanceofrain = Math.round((data.currently.precipProbability * 100) / 5) * 5;
    const temperature = Math.round(data.currently.temperature * 10) / 10;
    const feelslike = Math.round(data.currently.apparentTemperature * 10) / 10;
    const humidity = Math.round(data.currently.humidity * 100);
    const windspeed = data.currently.windSpeed;
    const final = `${icon in conditionMap ? conditionMap[icon] : ''} __${fullName}__
**Conditions**: ${condition}
**Temp**: ${temperature} °C
**Feels Like**: ${feelslike} °C
**Humidity**: ${humidity}%
**Chance of Rain**: ${chanceofrain}%
**Windspeed**: ${windspeed}Kts`;
    message.channel.send(final);
  },
  help: 'Search for weather on the web',
  args: '<location>',
  catagory: 'general'
}
