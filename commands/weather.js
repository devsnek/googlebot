var request = require('request');

module.exports = {
    main: function(bot, msg, settings) {
        args = msg.content;
var options = {
    headers: {'user-agent': 'Mozilla/5.0'},
    url: 'http://api.openweathermap.org/data/2.5/weather?apikey="+settings.config.owm+"&q='+args,
    json: true
};

conditionMap = {'01d': '🌞', '02d': '⛅️', '03d': '☁', '04d': '🌧', '09d': '🌧', '10d': '🌦', '11d': '⛈', '13d': '🌨', '50d': '🌫', '01n': '🌚', '02n': '⛅️', '03n': '☁', '04n': '🌧', '09n': '🌧', '10n': '🌦', '11n': '⛈', '13n': '🌨', '50n': '🌫'}

request.get(options, function(err, response, body_json) {
    if( !err && response.statusCode === 200 ){
        var desc = body_json['weather'][0]['description'],
            icon = conditionMap[body_json['weather'][0]['icon']],
            temp = Math.round(body_json['main']['temp']-273.15),
            humidity = body_json['main']['humidity'],
            wind = body_json['wind']['speed'],
            clouds = body_json['clouds']['all'],
            location = body_json['name'];
        var final = `${icon}__**${location}**__
**Conditions**: ${desc}
**Temp**: ${temp} °C
**Humidity**: ${humidity}%
**Cloudiness**: ${clouds}%`
        bot.sendMessage(msg, final);
    }
    else{
        console.log(err);
    }
});
    },
    help: 'Search for weather on the web',
    args: '<location>'
};
