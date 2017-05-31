app.controller('MenuAukerakCtrl', ['$scope', '$uibModalInstance', 'Database', 'Funtzioak', 'objektua_id', function($scope, $uibModalInstance, Database, Funtzioak, objektua_id) {
  $scope.ezabatu = function() {
    if (objektua_id > 0) {
      Database.query('DELETE FROM eszena_objektuak WHERE id=?', [parseInt(objektua_id)]).then(function() {
        $uibModalInstance.close({ aukera:1, objektua_id: objektua_id});
      }, function(error) {
        $uibModalInstance.close({ aukera:1, objektua_id: objektua_id});
        console.log("Objektua directive DELETE", error);
      });
    }
  };

  $scope.editatu = function() {
    if (objektua_id > 0) {
      $uibModalInstance.close({ aukera: 0, objektua_id: objektua_id });
      window.location = '#/editorea/' + objektua_id;      
    }
  };

  $scope.itxi = function() {
    $uibModalInstance.close({ aukera: 0, objektua_id: objektua_id });
  };

}]);
