'use strict';

/* Controllers */

var controllers = angular.module('controllers', []);

controllers.controller('AdminController', ['$scope', 'UserService', 'PowerPointsService', 'TraditionalService', 'SpellSetupService',
function($scope, UserService, PowerPointsService, TraditionalService, SpellSetupService) {

    $scope.users = UserService.query();

    $scope.edit = function(userId) {
	    $scope.user = UserService.get({userId:userId});
	};

    $scope.delete = function(userId) {
	    UserService.delete({userId:userId}).$promise.then(function() {
            $scope.users = UserService.query();
        });
	}

    $scope.clear = function() {
        $scope.user = {};
    };

    $scope.save = function() {
        var isNew = ($scope.user.id === null || $scope.user.id === undefined || $scope.user.id === '');
        UserService.save($scope.user).$promise.then(function(data) {
            $scope.users = UserService.query();
            $scope.user = {};
            if (isNew) {
                var setup = {userId: data.id}
                if (data.powerPoints) {
                    PowerPointsService.save({userId: data.id}, setup);
                } else {
                    setup.knownSpells = [0,0,0,0,0,0,0,0,0,0];
                    setup.remainingSpells = [0,0,0,0,0,0,0,0,0,0];
                    TraditionalService.save({userId: data.id}, setup);
                }
                var spellSetup = {
                    userId: data.id,
                    picked0: [],
                    picked1: [],
                    picked2: [],
                    picked3: [],
                    picked4: [],
                    picked5: [],
                    picked6: [],
                    picked7: [],
                    picked8: [],
                    picked9: []
                }
                SpellSetupService.save({userId: data.id}, spellSetup);
            }
        });
    }

}]);

controllers.controller('SpellBuddyController', ['$scope', '$cookieStore', 'SpellService', 'SpellSetupService', 'PowerPointsService', 'TraditionalService',
function($scope, $cookieStore, SpellService, SpellSetupService, PowerPointsService, TraditionalService) {

    $scope.prepared = [0,0,0,0,0,0,0,0,0,0];
    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
    if ($scope.user.powerPoints) {
        $scope.powerPoints = PowerPointsService.get({userId: $scope.user.id});
        $scope.spellSetup = SpellSetupService.get({userId:userId});
    } else {
        TraditionalService.get({userId: $scope.user.id}).$promise.then(function(data) {
            $scope.traditional = data;
            SpellSetupService.get({userId:userId}).$promise.then(function(data) {
                $scope.spellSetup = data;
                for (var i = 0; i < 10; i++) {
                    for (var j = 0; j < $scope.spellSetup['picked' + i].length; j++) {
                        if ($.inArray($scope.spellSetup['picked' + i][j].id, $scope.traditional['prepared' + i]) > -1) {
                            $scope.spellSetup['picked' + i][j].isPrepared = true;
                            $scope.prepared[i]++;
                        }
                    }
                }
            });
        });
    }
    //$scope.prepared = {'known0': 0,'known1': 0,'known2': 0,'known3': 0,'known4': 0,'known5': 0,'known6': 0,'known7': 0,'known8': 0,'known9': 0};
    //$scope.casted = {'known0': 0,'known1': 0,'known2': 0,'known3': 0,'known4': 0,'known5': 0,'known6': 0,'known7': 0,'known8': 0,'known9': 0};


    $scope.prep = function(level, plus) {
        plus ? $scope.prepared[sanitize(level)]++ : $scope.prepared[sanitize(level)]--;
    };

    $scope.isPrepared = function(level, spellId) {
        return $.inArray(spellId, $scope.traditional[level.replace('picked', 'prepared')]) > -1;
    };

    $scope.maxPrepared = function(level) {
        return $scope.traditional.knownSpells[sanitize(level)] === $scope.prepared[sanitize(level)];
        //return $scope.traditional[level.replace('picked', 'prepared')].length === $scope.traditional.knownSpells[sanitize(level)];
    };

    $scope.getComponents = function(spell) {
        var components = [];
        (spell.verbalComponent) ? components.push('V') : '';
        (spell.somaticComponent) ? components.push('S') : '';
        (spell.materialComponent) ? components.push('M') : '';
        (spell.arcaneFocusComponent) ? components.push('AF') : '';
        (spell.divineFocusComponent) ? components.push('DF') : '';
        (spell.xpComponent) ? components.push('XP') : '';
        (spell.metaBreathComponent) ? components.push('MB') : '';
        (spell.trueNameComponent) ? components.push('TN') : '';
        (spell.corruptComponent) ? components.push('C') : '';
        return components.join(', ');
    }

    $scope.getRemaining = function(level) {
        return $scope.traditional.remainingSpells[sanitize(level)];
    };

    $scope.cast = function(level) {
        if ($scope.user.powerPoints) {
            $scope.powerPoints.remainingPoints -= level;
            PowerPointsService.save({userId: userId}, $scope.powerPoints);
        } else {
            $scope.traditional.remainingSpells[sanitize(level)]--;
            TraditionalService.save({userId:userId}, $scope.traditional);
        }
    };


    $scope.rest = function() {
        if ($scope.user.powerPoints) {
            $scope.powerPoints.remainingPoints = $scope.powerPoints.totalPoints;
            PowerPointsService.save({userId: userId}, $scope.powerPoints);
        } else {

            $scope.traditional.remainingSpells = $.extend( true, [], $scope.traditional.knownSpells );
            var m = {};
            for (var i = 0; i < 10; i++) {
                var preped =  [];
                for (var j = 0; j < $scope.spellSetup['picked' + i].length; j++) {
                    if ($scope.spellSetup['picked' + i][j].isPrepared) {
                        preped.push($scope.spellSetup['picked' + i][j].id);
                    }
                }
                $scope.traditional['prepared' + i] = preped;
            }
            TraditionalService.save({userId:userId}, $scope.traditional);
        }
    };

    function sanitize(key) {
        return parseInt(key.replace('picked', ''));
    }


    $scope.isPicked = function(key) {
        return key.startsWith('picked');
    }
    //
    // $scope.isKnown = function(key) {
    //     return key.startsWith('known');
    // }

}]);

controllers.controller('SetupController', ['$scope', '$cookieStore', 'UserService', 'SpellService', 'DndSpellService', 'SpellSetupService', 'PowerPointsService', 'TraditionalService',
    function($scope, $cookieStore, UserService, SpellService, DndSpellService, SpellSetupService, PowerPointsService, TraditionalService) {

    $scope.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    $scope.user = $cookieStore.get('user');
    var userId = $scope.user.id
    $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
    $scope.letter = 'A';
    $scope.beginning = 0;
    $scope.pageSize = 10;

    if ($scope.user.powerPoints) {
        $scope.powerPoints = PowerPointsService.get({userId: $scope.user.id});
    } else {
        $scope.traditional = TraditionalService.get({userId: $scope.user.id});
    }

    DndSpellService.query({search: $scope.letter}).$promise.then(function(data) {
        $scope.dndSpells = data;
        $scope.showSpells(1);
    });

    SpellSetupService.get({userId:userId}).$promise.then(function(data) {
        $scope.spellSetup = data;
        //if ($scope.spellSetup.userId === undefined) {
        //    initSpellSetup();
        //}
    });

    $scope.addSpell = function(level, index) {
        $scope.spellSetup['picked' + level].push($scope.dndSpells[((($scope.page - 1) * $scope.pageSize) + index)]);
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

    $scope.isKnown = function(key) {
        return key.startsWith('known');
    }

    $scope.showSpells = function(page) {
            $scope.pages = Math.ceil($scope.dndSpells.length / $scope.pageSize);
        if (page <= $scope.pages && page >= 1) {
            $scope.page = page;
            $scope.beginning = (page - 1) * $scope.pageSize;
            $scope.displaySpells = $scope.dndSpells.slice($scope.beginning, (parseInt($scope.beginning) + parseInt($scope.pageSize)));
            $scope.currentPage = page
            $scope.ub = ((($scope.pages - $scope.currentPage) >= 4) ? $scope.currentPage + 4 : $scope.pages);
            if ($scope.currentPage < 6) {
                $scope.ub = (($scope.pages > 10) ? 10 : $scope.pages);
            }
            $scope.lb = ( ( ($scope.ub - 9) > 0) ? $scope.ub - 9 : 1)
        }
    }

    $scope.saveSpellsKnown = function() {
        TraditionalService.save({userId: userId}, $scope.traditional);
    };

    $scope.savePP = function() {
        PowerPointsService.save({userId: userId}, $scope.powerPoints);
    }

    // function initSpellSetup() {
    //     $scope.spellSetup =
    //     {
    //         userId: userId,
    //         picked0:[],
    //         picked1:[],
    //         picked2:[],
    //         picked3:[],
    //         picked4:[],
    //         picked5:[],
    //         picked6:[],
    //         picked7:[],
    //         picked8:[],
    //         picked9:[]
    //     }
    // }



    //
    // $scope.edit = function(level, index) {
    //     $scope.spell = $scope.spells[level][index];
	// };
    //
    //
    // $scope.clear = function() {
    //     $scope.spell = {};
    // };
    //
    // $scope.saveUser = function() {
    //     UserService.save($scope.user).$promise.then(function() {
    //         UserService.get({userId:userId}).$promise.then(function(data) {
    //             $cookieStore.put('user', data);
    //             $scope.user = $cookieStore.get('user');
    //         });
    //     });
    // }
    //
    // $scope.saveSpell = function() {
    //     $scope.spell.userId = userId;
    //     SpellService.save({userId: userId}, $scope.spell).$promise.then(function() {
    //         $scope.spell = {};
    //         $scope.spells = SpellService.get({userId:userId, spellId: 'order'});
    //     });
    // }
    //
    // $scope.isEven = function(num) {
    //     return (parseInt(num)) % 2 === 0;
    // };
    //
    //
    // $scope.preDelete = function(id) {
    //     $scope.toDelete = id
    // }
    //

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
