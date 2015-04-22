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
        UserService.save($scope.user).$promise.then(function() {
            $scope.users = UserService.query();
            $scope.user = {};
        });
    }

}]);

controllers.controller('SpellBuddyController', ['$scope', 'UserService', function($scope, UserService) {

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
        UserService.save($scope.user).$promise.then(function() {
            $scope.users = UserService.query();
            $scope.user = {};
        });
    }

}]);

controllers.controller('SetupController', ['$scope', '$cookieStore', 'UserService', 'SpellService',
    function($scope, $cookieStore, UserService, SpellService) {

    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.query({userId:userId});
    $scope.testSpells = SpellService.query({userId:userId, spellId: 'order'});



    $scope.edit = function(spellId) {
	    $scope.spell = SpellService.get({userId:userId, spellId: spellId});
	};

    $scope.delete = function(spellId) {
	    UserService.delete({userId: userId, spellId:spellId}).$promise.then(function() {
            $scope.spells = SpellService.query();
        });
	}

    $scope.clear = function() {
        $scope.spell = {};
    };

    $scope.saveUser = function() {
        UserService.save($scope.user)
    }

    $scope.saveSpell = function() {
        $scope.spell.userId = userId;
        SpellService.save({userId: userId}, $scope.spell).$promise.then(function() {
            $scope.spell = {};
            $scope.spells = SpellService.query({userId:userId});
        });
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
