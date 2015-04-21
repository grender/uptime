/**
 * Console plugin
 *
 * Logs all pings and events (up, down, paused, restarted) on the console
 *
 * Installation
 * ------------
 * This plugin is enabled by default. To disable it, remove its entry
 * from the `plugins` key of the configuration:
 *
 *   // in config/production.yaml
 *   plugins:
 *     # - ./plugins/console
 */
var Ping = require('../../models/ping');
var CheckEvent = require('../../models/checkEvent');
var Nexmo = require('easynexmo')
var config = require('config')

exports.initWebApp = function(enableNewEvents, enableNewPings) {
	if (typeof enableNewEvents == 'undefined') enableNewEvents = true;
	if (typeof enableNewPings == 'undefined') enableNewPings = true;
	if (enableNewEvents) registerNewEventsLogger();
	if (enableNewPings) registerNewPingsLogger();
}

Nexmo.initialize(config.nexmo.key, config.nexmo.secret, "https", true)

function postMessage(text) {
	console.log("SMS SENDING:" + text)
	Nexmo.sendTextMessage("uptime_bot", "79150971683", text, {}, function() {
		console.log("Message has been sent!")
		console.log(arguments)
	})
}

var registerNewEventsLogger = function() {
	CheckEvent.on('afterInsert', function(checkEvent) {
		checkEvent.findCheck(function(err, check) {
			console.log("QQQ")
			var message = check.name + ' ';
			switch (checkEvent.message) {
				case 'paused':
				case 'restarted':
					message += 'was ' + checkEvent.message;
					break;
				case 'down':
					message += 'went down (' + checkEvent.details + ')';
					break;
				case 'up':
					if (checkEvent.downtime) {
						message += 'went back up after ' + Math.floor(checkEvent.downtime / 1000) + 's of downtime';
					} else {
						message += 'is now up';
					}
					break;
				default:
					message += '(unknown event)';
			}

			postMessage(timestamp() + " " + message)
		});
	});
};

var registerNewPingsLogger = function() {
	/*
	Ping.on('afterInsert', function(ping) {
		ping.findCheck(function(err, check) {
			var message = check.name + ' ';
			message += (ping.isUp) ? 'OK':'responded with error "' + ping.error + '"';
			postMessage("uptime_bot",timestamp()+" "+message);
		});
	});
	*/
};


function timestamp() {
	return new Date().toLocaleTimeString();
}
