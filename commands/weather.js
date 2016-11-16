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
    const client = message.client;
    const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${message.content.split(' ').join('+')}&key=${client.config.google.mapsKey}`;
    let res = await superagent.get(mapsUrl);
    if (!res.body.results[0]) return message.channel.sendMessage('`Invalid Location!`');
    let geocode = [res.body.results[0].geometry.location.lat, res.body.results[0].geometry.location.lng].join(',');
    let fullName = res.body.results[0].formatted_address;
    res = await superagent.get(`https://api.darksky.net/forecast/${client.config.weather.forecastKey}/${geocode}?units=si`);
    let data = res.body;
    let condition = data.currently.summary;
    let icon = data.currently.icon;
    let chanceofrain = Math.round((data.currently.precipProbability * 100) / 5) * 5;
    let temperature = Math.round(data.currently.temperature * 10) / 10;
    let feelslike = Math.round(data.currently.apparentTemperature * 10) / 10;
    let humidity = Math.round(data.currently.humidity * 100);
    let windspeed = data.currently.windSpeed;
    let final = `${icon in conditionMap ? conditionMap[icon] : ''} __${fullName}__
**Conditions**: ${condition}
**Temp**: ${temperature} °C
**Feels Like**: ${feelslike} °C
**Humidity**: ${humidity}%
**Chance of Rain**: ${chanceofrain}%
**Windspeed**: ${windspeed}Kts`;
    message.channel.sendMessage(final);
  },
  help: 'Search for weather on the web',
  args: '<location>',
  catagory: 'general'
}
