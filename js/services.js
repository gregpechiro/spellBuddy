'use strict';

/* Services */

var services = angular.module('services', ['ngResource']);

services.factory('UserService', ['$resource', function($resource) {

    return $resource(host + '/user/:userId');

}]);

services.factory('SpellService', ['$resource', function($resource) {
    return $resource(host + '/user/:userId/spell/:spellId');
}]);

services.factory('DndSpellService', ['$resource', function($resource) {
    return $resource(host + '/dndspell/:spellId');
}]);

services.factory('SpellSetupService', ['$resource', function($resource) {
    return $resource(host + '/user/:userId/spellsetup/:setupId');
}]);

services.factory('TraditionalService', ['$resource', function($resource) {
    return $resource(host + '/user/:userId/traditional/:traditioanlId');
}]);

services.factory('PowerPointsService', ['$resource', function($resource) {
    return $resource(host + '/user/:userId/powerPoints/:powerPointsId');
}]);




services.factory('LoginService', ['$http', '$cookieStore', function($http, $cookieStore) {

    var adminLogin = function() {
        var user = {
            username:'admin',
            password:'admin',
            role:'ROLE_ADMIN'
        };
        $cookieStore.put('user', user);
    };

    var login = function(username, password) {
        var promise = $http.get(host + '/user/login', {
                params: {
                    'username': username,
                    'password': password
                }
            })
            .then(function(response) {
                if (response.data != null && JSON.stringify(response.data) != '{}' && response.data != '') {
                    $cookieStore.put('user', response.data);
                    return true;
                } else {
                    return false;
                }
            });
        return promise;
    };

    return {
        login : login,
        adminLogin:adminLogin
    }

}]);

services.factory('LogoutService', ['$cookieStore', function($cookieStore) {
    return function() {
        $cookieStore.remove('user');
    }
}]);
