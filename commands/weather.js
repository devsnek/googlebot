const unirest = require('unirest');

module.exports = {
  main: (bot, msg, settings) => {
    let args = msg.content;

    const conditionMap = {'01d': '🌞', '02d': '⛅️', '03d': '☁', '04d': '🌧', '09d': '🌧', '10d': '🌦', '11d': '⛈', '13d': '🌨', '50d': '🌫', '01n': '🌚', '02n': '⛅️', '03n': '☁', '04n': '🌧', '09n': '🌧', '10n': '🌦', '11n': '⛈', '13n': '🌨', '50n': '🌫'}

    unirest.get('http://api.openweathermap.org/data/2.5/weather?apikey=' + settings.config.owm + '&q=' + args)
    .end(res => {
      try {
        let body = res.body;
        let desc = body['weather'][0]['description'];
        let icon = conditionMap[body['weather'][0]['icon']];
        let temp = Math.round(body['main']['temp'] - 273.15);
        let humidity = body['main']['humidity'];
        // let wind = body['wind']['speed'];
        let clouds = body['clouds']['all'];
        let location = body['name'];
        var final = `${icon}__**${location}**__
**Conditions**: ${desc}
**Temp**: ${temp} °C
**Humidity**: ${humidity}%
**Cloudiness**: ${clouds}%`
        msg.channel.sendMessage(final);
      } catch (err) {
        msg.channel.sendMessage('`Could not find location!`');
      }
    });
  },
  help: 'Search for weather on the web',
  args: '<location>',
  catagory: 'general'
};
