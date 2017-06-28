app.controller('ElkarbanatuCtrl', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
  $scope.elkarbanatu = function() {
    $uibModalInstance.close({
      aukera: 1
    });
  };

  $scope.itxi = function() {
    $uibModalInstance.close({
      aukera: 0
    });
  };

}]);
