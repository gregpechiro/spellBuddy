'use strict';

/* App Module */

var app = angular.module('spellBuddy', [
	'ngRoute',
	'ngCookies',
	'controllers',
	'services'
]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			resolve: {
		        factory: checkAuth
		    },
			templateUrl: 'spellBuddy.html',
			controller: 'SpellBuddyController'
		})
		.when('/setup', {
			resolve: {
		        factory: checkAuth
		    },
			templateUrl: 'setup.html',
			controller: 'SetupController'
		})
		.when('/admin', {
			resolve: {
		        factory: checkAdmin
		    },
			templateUrl: 'admin.html',
			controller: 'AdminController'
		})
		.when('/login', {
			templateUrl: 'login.html',
		    controller: 'LoginController'
		})
		.when('/logout', {
		    resolve: {
		        factory : logout
		    },
		    redirectTo : '/login'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

var checkAuth = function($cookieStore, $location) {
    var user = $cookieStore.get('user')
    if (user != null && user != {}) {
        return true;
    } else {
        $location.path('/login');
    }
};

var checkAdmin = function($cookieStore, $location) {
    var user = $cookieStore.get('user');
    if (user != null && user != {}) {
        if (user.role == 'ROLE_ADMIN') {
            return true;
        } else {
            $location.path('/error');
        }
    } else {
        $location.path('/');
    }
}

var logout = function($cookieStore) {
    $cookieStore.remove('user');
};
