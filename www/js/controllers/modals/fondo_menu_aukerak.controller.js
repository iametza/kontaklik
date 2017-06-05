app.controller('FondoMenuAukerakCtrl', ['$scope', '$uibModalInstance', 'Database', 'Funtzioak', 'fondo_id', function($scope, $uibModalInstance, Database, Funtzioak, fondo_id) {
  $scope.ezabatu = function() {
    if (fondo_id > 0) {
      Database.query('DELETE FROM eszena_objektuak WHERE id=?', [parseInt(fondo_id)]).then(function() {
        $uibModalInstance.close({ aukera:1, fondo_id: fondo_id});
      }, function(error) {
        $uibModalInstance.close({ aukera:1, fondo_id: fondo_id});
        console.log("Objektua directive DELETE", error);
      });
    }
  };

  $scope.editatu = function() {
    if (fondo_id > 0) {
      $uibModalInstance.close({ aukera: 0, fondo_id: fondo_id });
      window.location = '#/editorea/' + fondo_id;
    }
  };

  $scope.itxi = function() {
    $uibModalInstance.close({ aukera: 0, fondo_id: fondo_id });
  };

}]);
