app.controller('EszenaMenuAukerakCtrl', ['$scope', '$uibModalInstance', 'Database', 'eszena_id', function($scope, $uibModalInstance, Database, eszena_id) {
  $scope.ezabatu = function() {
    if (eszena_id > 0) {
      $uibModalInstance.close({
        aukera: 1,
        eszena_id: eszena_id
      });
    }
  };

  $scope.itxi = function() {
    $uibModalInstance.close({
      aukera: 0,
      eszena_id: eszena_id
    });
  };

}]);
