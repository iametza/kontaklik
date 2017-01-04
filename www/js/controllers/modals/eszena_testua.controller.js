app.controller('ModalEszenaTestuaCtrl',['$scope', '$compile', '$uibModalInstance', 'Database', 'eszena_id', function($scope, $compile, $uibModalInstance, Database, eszena_id){
  
  $scope.eremuak = {
    testua: ''
  };
  $scope.errore_mezua = '';
  
  $scope.testua_gorde = function (form){
    
    if (form.$valid){
      
      Database.insertRow ('testuak', {'fk_eszena': eszena_id, 'testua': $scope.eremuak.testua}).then (function (emaitza){
      
        $uibModalInstance.close (emaitza.insertId);
        
      }, function (error){
        console.log ("ModalEszenaTestuaCtrl, testua_gorde", error);
        $scope.itxi ();
      });
      
    }
    
  };
  
  $scope.itxi = function () {
    
    $uibModalInstance.dismiss ('itxi');
    
  };

}]);