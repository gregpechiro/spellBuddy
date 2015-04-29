var filters = angular.module('filters', []);

filters.filter('range', function() {
    return function(input, $scope) {
        for (var i = $scope.lb; i <= $scope.ub; i++) {
            input.push(i);
        }
        return input;
    };
});

filters.filter('picked', function() {
    return function(input) {
        return input.replace('picked', '');
    };
});
