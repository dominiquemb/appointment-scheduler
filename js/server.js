var http = require('http');
var url = require('url');
var querystring = require('qs');

var mysql      = require('mysql');
var connectionParams = {
	    host     : 'localhost',
	    database : 'xocolatl',
	    user     : 'xocolatl',
	    password : 'xocolatl',
};

var connection = mysql.createConnection(connectionParams);

var typeLabels = {
	'1': 'Jedi Stress Management',
	'2': 'Light Saber Skills',
	'3': 'Fighting the Dark Side'
};

var convertTimeInterval = function(input) {
	var time = convertTime(input);

	if (time.length) {
		time = time.split(' ')[0];
	}

	return time;
};

var convertTime = function(input) {
	var hour = null;
	var minute = null;
	var am_or_pm = null;

	if (typeof input == "number") {
		time = String(input.toFixed(2)).split('.');
	} else if (typeof input == "string") {
		time = String(input).split('.');
	}
	// convert 24-hour time to 12-hour time
	hour = (time[0] > 12) ? time[0] - 12 : time[0];

	// convert '9.75' to '9.45', for example
	minute = 60*(time[1]/100);
	minute = (minute == 0) ? '00' : minute;
	am_or_pm = (time[0] > 12) ? 'PM' : 'AM'; 

	timeString = hour + ':' + minute + ' ' + am_or_pm; 
	return timeString;
};

var timeStringToFloat = function(input) {
	var time_without_ampm = input.split(' ')[0];
	var ampm = input.split(' ')[1];

	var hours = parseInt(time_without_ampm.split(':')[0]);
	var minutes = parseInt(time_without_ampm.split(':')[1]);

	if (ampm.length) {
		if (ampm.toLowerCase() == "pm") {
			hours += 12;
		}
	}

	minutes = minutes/60;

	var output = hours + minutes;
	console.log('output');
	console.log(output);

	return output.toFixed(2);
}

var timeIntervalStringToFloat = function(input) {
	var hours = parseInt(input.split(':')[0]);
	var minutes = parseInt(input.split(':')[1]);

	var output = hours + (minutes/60);

	return output;
}

connection.connect(function(err) {
    if (err) {
	console.error('Error connecting: ' + err.stack);
	return;
    }

    console.log('Connected as id ' + connection.threadId);
});

//create a server object:
var server = http.createServer(function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.setHeader('Content-Type', 'application/json');
//	res.writeHead(200, {'Content-Type': 'text/html'});
	var parsed = url.parse(req.url, true);

	if (req.method == 'OPTIONS') {
		console.log('OPTIONS');
		res.statusCode = 200;
		res.end();
	}


	if (parsed.pathname === '/timeslots') {
		console.log(req.method);
		if (req.method == 'GET') {
			console.log(parsed.query);

			if (req.method == 'GET') {
				connection.query('SELECT * FROM time_settings WHERE type = ? LIMIT 1', [parsed.query.type], function (error, time_settings_results, fields) {
					Object.keys(time_settings_results).forEach(function(time_settings_key) {
						var newtimeslots = [];

						var start_time = parseFloat(time_settings_results[time_settings_key].start_time);
						var end_time = parseFloat(time_settings_results[time_settings_key].end_time);
						var interval = parseFloat(time_settings_results[time_settings_key].time_interval);
						var slots_per_time = time_settings_results[time_settings_key].places;
						var timeString = null;
						var timeslots = [];

						var takenSlots = {};
						/*
						console.log('start_time');
						console.log(start_time);
						console.log('end_time');
						console.log(end_time);
						console.log('interval');
						console.log(interval);
						console.log('slots_per_time');
						console.log(slots_per_time);
						*/

						connection.query('SELECT * FROM appointments WHERE date = ? AND type = ?', [parsed.query.date, parsed.query.type], function (error, results, fields) {
							Object.keys(results).forEach(function(key) {
								var time = results[key].time;
								if (takenSlots[time] == undefined) {
									takenSlots[time] = 1;
								}
								else {
									takenSlots[time] = takenSlots[time]+1;
								}

							});
							console.log('taken');
							console.log(takenSlots);

							for (i = start_time; i < end_time; i=(i+interval)) {
								if (takenSlots[i.toFixed(2)] !== slots_per_time) { 

									timeString = convertTime(i);
									
									timeslots.push({value: i.toFixed(2), label: timeString});
								}
							}
							res.write(JSON.stringify(timeslots));
							res.end();
						});
					});
				});
			}
		}
	}

	if (parsed.pathname === '/appointmenttypes') {
		if (req.method == 'GET') {
			connection.query("SELECT * FROM time_settings", function(err, results) {
				Object.keys(results).forEach(function(key) {
					type = results[key].type;

					results[key].startTimeLabel = convertTime(results[key].start_time);
					results[key].endTimeLabel = convertTime(results[key].end_time);
					results[key].timeIntervalLabel = convertTimeInterval(results[key].time_interval);
					results[key]['typeLabel'] = typeLabels[type];
				});
				res.write(JSON.stringify(results));
				res.end();

			});
		}
	}

	if (parsed.pathname === '/appointmenttype') {
		if (req.method == 'GET') {
			connection.query("SELECT * FROM time_settings WHERE type = ? LIMIT 1", [parsed.query.id], function(err, results) {
				Object.keys(results).forEach(function(key) {
					type = results[key].type;

					results[key].start_time = convertTime(results[key].start_time);
					results[key].end_time = convertTime(results[key].end_time);
					results[key].time_interval = convertTimeInterval(results[key].time_interval);
					results[key].type = typeLabels[type];
				});
				res.write(JSON.stringify(results));
				res.end();

			});
		}

		if (req.method == 'PUT') {
			var start_time = timeStringToFloat(parsed.query.start_time);
			var end_time = timeStringToFloat(parsed.query.end_time);
			var time_interval = timeIntervalStringToFloat(parsed.query.time_interval);
			connection.query("UPDATE time_settings SET start_time = ?, end_time = ?, time_interval = ?, places = ? WHERE type = ?", [start_time, end_time, time_interval, parsed.query.places, parsed.query.type], function(err, results) {
				res.write(JSON.stringify(results));
				res.end();
			});
		}
	}

	if (parsed.pathname === '/appointment') {
		if (req.method == 'PUT') {
			if (parsed.query.custom_time) {
				var time = timeStringToFloat(parsed.query.custom_time);
				connection.query("UPDATE appointments SET name = ?, type = ?, date = ?, time = ? WHERE id = ?", [parsed.query.name, parsed.query.type, parsed.query.date, time, parsed.query.id], function(err, result) {
					console.log('1 row updated');
					res.write(JSON.stringify(result));
					res.end();
				});
			} else {
				connection.query("UPDATE appointments SET name = ?, type = ?, date = ?, time = ? WHERE id = ?", [parsed.query.name, parsed.query.type, parsed.query.date, parsed.query.time, parsed.query.id], function(err, result) {
					console.log('1 row updated');
					res.write(JSON.stringify(result));
					res.end();
				});
			}
		}

		if (req.method == 'GET') {
			connection.query("SELECT * FROM appointments WHERE id = ? LIMIT 1", [parsed.query.id], function(err, results) {
				console.log('row fetched');
//				var parsedResults = [];
				Object.keys(results).forEach(function(key) {
					type = results[key].type;

					results[key].timeLabel = convertTime(results[key].time);
					results[key]['typeLabel'] = typeLabels[type];

//					parsedResults.push(results[key]);
				});
				res.write(JSON.stringify(results));
				res.end();
			});
		}
	}

	if (parsed.pathname === '/appointments') {
		console.log(req.method);
		if (req.method == 'DELETE') {
			console.log('id');
			console.log(parsed.query.id);
			connection.query("UPDATE appointments SET canceled = 1  WHERE id = ?", [parsed.query.id], function(err, result) {
				console.log('1 row updated');
				res.write(JSON.stringify(result));
				res.end();
			});
		}

		if (req.method == 'PUT') {
			connection.query("UPDATE appointments SET name = ?, type = ?, date = ?, time = ? WHERE id = ?", [parsed.query.name, parsed.query.type, parsed.query.date, parsed.query.time, parsed.query.id], function(err, result) {
				console.log('1 row updated');
				res.write(JSON.stringify(result));
				res.end();
			});
		}

		if (req.method == 'POST') {
			var sql = "INSERT into appointments (name, type, date, time) values (?, ?, ?, ?)";
			var values = [parsed.query.name, parsed.query.type, parsed.query.date, parsed.query.time];

			connection.query(sql, values, function(err, result) {
				if (err) {
					res.statusCode = 500;
					res.end();
					throw err;
				}
				console.log("1 record inserted");
				res.write(JSON.stringify({'id': result.insertId}));
				res.end();
			});
		}

		if (req.method == 'GET') {
			connection.query('SELECT * FROM appointments', function (error, results, fields) {
			    if (error) {
				res.statusCode = 500;
				res.end();
				throw error;
			    }

				var type = null;
				var parsedResult = null;
				var parsedResults = [];


				Object.keys(results).forEach(function(key) {
					type = results[key].type;

					results[key].time = convertTime(results[key].time);
					results[key]['typeLabel'] = typeLabels[type];
					results[key]['canceledLabel'] = (results[key].canceled) ? 'Canceled' : null;

					parsedResults.push(results[key]);
				});

				res.write(JSON.stringify(parsedResults));
				res.end();
			});
		}
	}

}).listen(3000, function(){
 console.log("server start at port 3000"); //the server object listens on port 3000
});

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  connection.end();
  server.close();
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  connection.end();
  server.close();
});
