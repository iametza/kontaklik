app.controller('ObjektuMenuaCtrl', ['$scope', '$uibModalInstance', 'Database', 'Funtzioak', 'objektua_id', function($scope, $uibModalInstance, Database, Funtzioak, objektua_id) {
  $scope.ezabatu = function() {
    if (objektua_id > 0) {
      Database.query('DELETE FROM eszena_objektuak WHERE id=?', [parseInt(objektua_id)]).then(function() {
        $uibModalInstance.close(1);
      }, function(error) {
        console.log("Objektua directive DELETE", error);
      });
    }
  };
  $scope.lehenengo_planora = function() {

  };
  $scope.buelta_eman = function() {

  };
  $scope.bikoiztu= function() {
    if (objektua_id > 0) {
      Database.query('INSERT INTO eszena_objektuak(fk_eszena, fk_objektua) SELECT fk_eszena, fk_objektua FROM eszena_objektuak WHERE id=?', [parseInt(objektua_id)]).then(function(res) {
        var new_id = res.insertId;
        Funtzioak.objektuaEszenara(new_id, true, false, $scope.$parent).then(function() {
          $uibModalInstance.close(2);
        }, function(error) {
          console.log("Objektua directive objektuaEszenara", error);
          $uibModalInstance.close(2);
        });
      }, function(error) {
        $uibModalInstance.close(2);
        console.log("Objektua directive DUPLICATE", error);
      });
    }
  }
  $scope.itxi = function() {
    $uibModalInstance.close(0);
  };

}]);
