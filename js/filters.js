var filters = angular.module('filters', []);

filters.filter('range', function() {
    return function(input, $scope) {
        for (var i = $scope.lb; i <= $scope.ub; i++) {
            input.push(i);
        }
        return input;
    };
});

filters.filter('setup', function() {
    return function(input) {
        input = input.replace('picked', '');
        return input.replace('known', '');
    };
});
