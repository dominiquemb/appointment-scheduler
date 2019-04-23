var app = angular.module("app", ['ui.router', 'ui.bootstrap']);
var prefix = 'http://dominique.cc:3000';

app.config(function($stateProvider, $urlRouterProvider) {
	var viewAppointmentTypesState = {
		name: 'viewappointmenttypes',
		url: '/view-appointment-types',
		controller: "ViewAppointmentTypesController",
		templateUrl: 'views/admin/view-appointment-types.html'
	};
	var appointmentConfirmedState = {
		name: 'appointmentconfirmed',
		url: '/appointment-confirmed',
		templateUrl: 'views/appointment-confirmed.html'
	};
	var editAppointmentTypeState = {
		name: 'editappointmenttype',
		url: '/edit-appointment-type',
		params: {
			id: null
		},
		controller: "ManageAppointmentTypeController",
		templateUrl: 'views/admin/edit-appointment-type.html'
	};
	var editAppointmentState = {
		name: 'editappointment',
		url: '/edit-appointment',
		params: {
			id: null
		},
		controller: "ManageAppointmentController",
		templateUrl: 'views/admin/edit-appointment.html'
	};
	var newAppointmentState = {
		name: 'newappointment',
		url: '/book-appointment',
		controller: "ManageAppointmentController",
		templateUrl: 'views/new-appointment.html'
	};
	var adminNewAppointmentState = {
		name: 'adminnewappointment',
		url: '/admin-book-appointment',
		controller: "ManageAppointmentController",
		templateUrl: 'views/admin/new-appointment.html'
	};
	var viewAppointmentsState = {
		name: 'viewappointments',
		url: '/view-appointments',
		controller: "ViewAppointmentsController",
		templateUrl: 'views/admin/view-appointments.html'
	};
	$stateProvider
		.state(newAppointmentState)
		.state(viewAppointmentTypesState)
		.state(editAppointmentTypeState)
		.state(appointmentConfirmedState)
		.state(adminNewAppointmentState)
		.state(editAppointmentState)
		.state(viewAppointmentsState);

	$urlRouterProvider.when('', '/book-appointment');
	$urlRouterProvider.when('/', '/book-appointment');
	$urlRouterProvider.when('/admin', '/view-appointments');

});

app.directive("navbar", function() {
	return {
		restrict: 'ACE',
		templateUrl: 'views/admin/navbar.html'
	}
});

app.controller("ViewAppointmentTypesController", function($scope, $http, $state) {
	$scope.getAppointmentTypes = function() {
		$http.get(prefix + '/appointmenttypes')
			.then(function(result) {
				$scope.appointmenttypes = result.data;
				console.log(result.data);
			}, function(error) {
				console.log(error);
			});

	};

	$scope.editAppointmentType = function(evt, id) {
		evt.preventDefault();
		console.log(id);
console.log(id);
		$state.go('editappointmenttype', {'id': id});
	};

	$scope.getAppointmentTypes();
});

app.controller("ViewAppointmentsController", function($scope, $http, $state) {
	$scope.getAppointments = function() {
		$http.get(prefix + '/appointments')
			.then(function(result) {
				$scope.appointments = result.data;
				console.log(result.data);
			}, function(error) {
				console.log(error);
			});

	};

	$scope.editAppointment = function(evt, id) {
		evt.preventDefault();
		console.log(id);

		$state.go('editappointment', {'id': id});
	};

	$scope.cancelAppointment = function(evt, row) {
		evt.preventDefault();

		$http.delete(prefix + '/appointments', {'params': {'id': row.id}})
			.then(function(result) {
				console.log(result);
				row['canceledLabel'] = 'Canceled';
			}, function(error) {
				console.log(error);
			});
	};

	$scope.getAppointments();
});

app.controller("DatepickerController", function($scope) {
  $scope.today = function() {
    $scope.data.selecteddate = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.data.selecteddate = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
});

app.controller("ManageAppointmentTypeController", function($scope, $timeout, $http, $state, $stateParams) {
	$scope.data = {
		type: null,
		start_time: null,
		end_time: null,
		time_interval: null,
		places: null,
		appointmenttypes: [
			{value: '1', label: 'Jedi Stress Management'},
			{value: '2', label: 'Light saber skills'},
			{value: '3', label: 'Fighting the dark side'}
		]
	}

	if ($stateParams['id']) {
		$http.get(prefix + '/appointmenttype', {'params': {'id': $stateParams['id']}})
			.then(function(result) {
				$scope.data.type = result.data[0].type;
				$scope.data.start_time = result.data[0].start_time;
				$scope.data.end_time = result.data[0].end_time;
				$scope.data.time_interval = result.data[0].time_interval;
				$scope.data.places = result.data[0].places;
				console.log($scope.data);
			}, function(error) {
				console.log(error);
			});

	}

	$scope.submitEditAppointmentType = function() {
		$http.put(prefix + '/appointmenttype?type=' + $stateParams['id'] + '&start_time=' + $scope.data.start_time + ' &end_time=' + $scope.data.end_time + '&time_interval=' + $scope.data.time_interval + '&places=' + $scope.data.places)
			.then(function(result) {
				console.log($scope.result);
				$state.go('viewappointmenttypes');
			}, function(error) {
				console.log(error);
			});
	};
});

app.controller("ManageAppointmentController", function($scope, $timeout, $http, $state, $stateParams) {
	$scope.override = false;

	$scope.data = {
		fullname: null,
		selectedtype: null,
		selectedtime: null,
		selecteddate: null,
		custom_time: null,
		appointmenttypes: [
			{value: '1', label: 'Jedi Stress Management'},
			{value: '2', label: 'Light saber skills'},
			{value: '3', label: 'Fighting the dark side'}
		],
		timeslots: []
	}

	if (typeof $stateParams['id'] == "number") {
		$http.get(prefix + '/appointment', {'params': {'id': $stateParams['id']}})
			.then(function(result) {
				console.log(result);
				if (result['data']) {
					if (result['data'][0]) {
							$scope.data.fullname = result.data[0].name;
							$scope.data.selectedtype = String(result.data[0].type);
							$scope.data.selecteddate = new Date(result.data[0].date);
							$scope.data.selectedid = result.data[0].id;

							$http.get(prefix + '/timeslots', {'params': {'type': $scope.data.selectedtype, 'date': $scope.getSelectedDate()}})
							.then(function(timeslots_result) {
								$scope.data.timeslots = timeslots_result.data;
								$scope.data.selectedtime = result.data[0].time;
							}, function(error) {
								console.log(error);
							});
					}
				}
			}, function() {
				console.log(result);
			});
	}

	$scope.getSelectedDate = function(obj) {
		return $scope.data.selecteddate.getMonth() + '/' + $scope.data.selecteddate.getDate() + '/' + $scope.data.selecteddate.getFullYear();
	};

	$scope.enterCustomTime = function() {
		$scope.override = !$scope.override;
		if (!$scope.override) {
			// reset custom time field
			$scope.data.custom_time = null;
		}
	};

	$scope.submitNewAppointment = function() {
		$http.post(prefix + '/appointments?name=' + $scope.data.fullname + '&type=' + $scope.data.selectedtype + '&date=' + $scope.getSelectedDate() + '&time=' + $scope.data.selectedtime)
		.then(function(result) {
				console.log('appointment submitted');
				console.log($scope.data);
			console.log(result);
			$state.go('appointmentconfirmed');
		},
		function(error) {
			console.log(error);
		});
	};

	$scope.generateTimeslots = function() {
		console.log('a');
			$http.get(prefix + '/timeslots', {'params': {'type': $scope.data.selectedtype, 'date': $scope.getSelectedDate()}})
			.then(function(result) {
				$scope.data.timeslots = result.data;
				console.log('TIMESLOTS');
				console.log($scope.data.timeslots);
			}, function(error) {
				console.log(error);
			});
	}

	$scope.submitEditAppointment = function() {
		$http.put(prefix + '/appointment?name=' + $scope.data.fullname + '&type=' + $scope.data.selectedtype + '&date=' + $scope.data.selecteddate + '&time=' +  $scope.data.selectedtime + '&custom_time=' + $scope.data.custom_time + '&id=' + $scope.data.selectedid)
			.then(function(result) {
				$state.go('viewappointments');
			}, function(error) {
				console.log(error);
			});
	};
});
