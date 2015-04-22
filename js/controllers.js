'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);

controllers.controller('AdminController', ['$scope', 'UserService', function($scope, UserService) {

    $scope.users = UserService.query();

    $scope.edit = function(userId) {
	    $scope.user = UserService.get({userId:userId});
	};

    $scope.delete = function(userId) {
        console.log(userId);
	    UserService.delete({userId:userId}).$promise.then(function() {
            $scope.users = UserService.query();
        });
	}

    $scope.clear = function() {
        $scope.user = {};
    };

    $scope.save = function() {
        if ($scope.user.id === null || $scope.user.id === undefined || $scope.user.id === '') {
            $scope.user.spellsPerDay =
            {'0': 0,'1': 0,'2': 0,'3': 0,'4': 0,'5': 0,'6': 0,'7': 0,'8': 0,'9': 0,};
        }
        UserService.save($scope.user).$promise.then(function() {
            $scope.users = UserService.query();
            $scope.user = {};
        });
    }

}]);

controllers.controller('SpellBuddyController', ['$scope', '$cookieStore', 'SpellService', function($scope, $cookieStore, SpellService) {

    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
    $scope.prepared = {'0': 0,'1': 0,'2': 0,'3': 0,'4': 0,'5': 0,'6': 0,'7': 0,'8': 0,'9': 0,};
    $scope.casted = {'0': 0,'1': 0,'2': 0,'3': 0,'4': 0,'5': 0,'6': 0,'7': 0,'8': 0,'9': 0,};

    $scope.isEven = function(num) {
        return (parseInt(num)) % 2 === 0;
    };

    $scope.prep = function(level, plus) {
        plus ? $scope.prepared[level]++ : $scope.prepared[level]--;
    };

    $scope.cast = function(level) {
        $scope.casted[level]++;
    };

    $scope.rest = function() {
        $scope.casted = {'0': 0,'1': 0,'2': 0,'3': 0,'4': 0,'5': 0,'6': 0,'7': 0,'8': 0,'9': 0,};
    };

}]);

controllers.controller('SetupController', ['$scope', '$cookieStore', 'UserService', 'SpellService',
    function($scope, $cookieStore, UserService, SpellService) {

    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.get({userId:userId, spellId: 'order'});

    $scope.edit = function(level, index) {
        $scope.spell = $scope.spells[level][index];
	};

    $scope.delete = function(spellId) {
	    SpellService.delete({userId: userId, spellId:spellId}).$promise.then(function() {
            $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
            $scope.toDelete = 0;
        });
	}

    $scope.clear = function() {
        $scope.spell = {};
    };

    $scope.saveUser = function() {
        UserService.save($scope.user).$promise.then(function() {
            UserService.get({userId:userId}).$promise.then(function(data) {
                $cookieStore.put('user', data);
                $scope.user = $cookieStore.get('user');
            });
        });
    }

    $scope.saveSpell = function() {
        $scope.spell.userId = userId;
        SpellService.save({userId: userId}, $scope.spell).$promise.then(function() {
            $scope.spell = {};
            $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
        });
    }

    $scope.isEven = function(num) {
        return (parseInt(num)) % 2 === 0;
    };


    $scope.preDelete = function(id) {
        $scope.toDelete = id
    }

}]);


controllers.controller('LoginController', ['$location', '$scope', '$cookieStore', 'LoginService',
    function($location, $scope, $cookieStore, LoginService) {

    var user = $cookieStore.get('user');

    if (user != undefined) {
        if (user.role == 'ROLE_ADMIN') {
            $location.path('/admin');
        } else{
            $location.path('/');
        }
    }

    $scope.login = function() {
        if ($scope.username == 'admin' && $scope.password == 'admin') {
            LoginService.adminLogin();
             $location.path('/admin');
        } else {
            LoginService.login($scope.username, $scope.password).then(function(data) {
                if (data) {
                    var newUser = $cookieStore.get('user');
                    if (newUser.role == 'ROLE_ADMIN') {
                        $location.path('/admin');
                    } else{
                        $location.path('/');
                    }
                } else {
                    $scope.err = true;
                }
            });
        }
    }

    $scope.err = false;
}]);
