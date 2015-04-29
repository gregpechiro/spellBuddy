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

controllers.controller('SetupController', ['$scope', '$cookieStore', 'UserService', 'SpellService', 'DndSpellService', 'SpellSetupService',
    function($scope, $cookieStore, UserService, SpellService, DndSpellService, SpellSetupService) {

    $scope.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
    $scope.letter = 'A';
    $scope.beginning = 0;
    $scope.pageSize = 10;
    $scope.pages = 1;

    DndSpellService.query({search: $scope.letter}).$promise.then(function(data) {
        $scope.dndSpells = data;
        $scope.showSpells(1);
    });
    $scope.spellSetup = SpellSetupService.get({userId:userId});

    $scope.addSpell = function(level, index) {
        if ($scope.spellSetup.userId === undefined) {
            $scope.spellSetup =
            {
                userId: userId,
                known0:0,
                known1:0,
                known2:0,
                known3:0,
                known4:0,
                known5:0,
                known6:0,
                known7:0,
                known8:0,
                known9:0,
                picked0:[],
                picked1:[],
                picked2:[],
                picked3:[],
                picked4:[],
                picked5:[],
                picked6:[],
                picked7:[],
                picked8:[],
                picked9:[]
            }
        }
        $scope.spellSetup['picked' + level].push($scope.dndSpells[index]);
        SpellSetupService.save({userId: userId}, $scope.spellSetup);
        level = '';
    };

    $scope.changeLevel = function(current, newLevel, index) {
        var spell = $scope.spellSetup[current][index];
        $scope.spellSetup[current] = $scope.spellSetup[current].slice(0, index).concat($scope.spellSetup[current].slice((index + 1), $scope.spellSetup[current].length));
        if ($scope.spellSetup[current] === '') {
            $scope.spellSetup[current] = [];
        }
        $scope.spellSetup['picked' + newLevel].push(spell);
        SpellSetupService.save({userId: userId}, $scope.spellSetup);
    }

    $scope.getFirstLetter = function(letter) {
        $scope.letter = letter;
        DndSpellService.query({search: $scope.letter}).$promise.then(function(data) {
            $scope.dndSpells = data;
            $scope.showSpells(1);
        });
    };

    $scope.delete = function(current, index) {
        $scope.spellSetup[current] = $scope.spellSetup[current].slice(0, index).concat($scope.spellSetup[current].slice((index + 1), $scope.spellSetup[current].length));
        if ($scope.spellSetup[current] === '') {
            $scope.spellSetup[current] = [];
        }
        SpellSetupService.save({userId: userId}, $scope.spellSetup);
	}

    $scope.isPicked = function(key) {
        return key.startsWith('picked');
    }

    $scope.showSpells = function(page) {
        if (page <= $scope.pages && page >= 1) {
            $scope.page = page;
            $scope.beginning = (page - 1) * $scope.pageSize;
            $scope.displaySpells = $scope.dndSpells.slice($scope.beginning, ($scope.beginning + $scope.pageSize));
            $scope.pages = Math.ceil($scope.dndSpells.length / $scope.pageSize);
            $scope.currentPage = page
            $scope.ub = ((($scope.pages - $scope.currentPage) >= 4) ? $scope.currentPage + 4 : $scope.pages);
            if ($scope.currentPage < 6) {
                $scope.ub = (($scope.pages > 10) ? 10 : $scope.pages);
            }
            $scope.lb = ( ( ($scope.ub - 9) > 0) ? $scope.ub - 9 : 1)
        }

        // (beg / pagesize) +1 = current
        //(current-1) * pageSize = beg
    }




    $scope.edit = function(level, index) {
        $scope.spell = $scope.spells[level][index];
	};


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
