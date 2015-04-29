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
var Hipchat = require('node-hipchat')
var config = require('config')
var moment = require('moment-timezone')
var https = require('https')
var url = require('url')
var util = require('util')


exports.initWebApp = function(enableNewEvents, enableNewPings) {
	if (typeof enableNewEvents == 'undefined') enableNewEvents = true;
	if (typeof enableNewPings == 'undefined') enableNewPings = true;
	if (enableNewEvents) registerNewEventsLogger();
	if (enableNewPings) registerNewPingsLogger();
};

var registerNewEventsLogger = function() {
	var cfg = config.slack
	CheckEvent.on('afterInsert', function(checkEvent) {
		checkEvent.findCheck(function(err, check) {
			var payload = {};
			if (err) return console.error(err);
			payload.channel = cfg.channel;
			payload.username = cfg.username;
			payload.text = '<' + cfg.dashboardUrl + '/dashboard/checks/' + check._id + '?type=hour&date=' + checkEvent.timestamp.valueOf() + '|' + check.name + '>' + ' ' + cfg.iconEmoji[checkEvent.message] + ' ' + checkEvent.message;
			var options = url.parse(cfg.hookUrl);
			options.method = 'POST';
			options.headers = {
				'Content-Type': 'application/json'
			};

			var req = https.request(options, function(res) {});

			req.on('error', function(e) {
				console.log('Problem with webhook request: ' + e.message);
			});

			req.write(JSON.stringify(payload));
			req.end();
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

