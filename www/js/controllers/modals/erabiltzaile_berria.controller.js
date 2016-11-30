'use strict';
app.controller('ModalErabiltzaileBerriaCtrl',['$scope', '$uibModalInstance', 'Database', function($scope, $uibModalInstance, Database){
  
  $scope.eremuak = {
    izena: ''
  };
  $scope.errore_mezua = '';
  
  $scope.erabiltzaile_berria_sortu = function (form){
    //console.log ("time", Math.floor(Date.now() / 1000));
    
    if (form.$valid){
      
      // Comprobamos que no exista el usuario
      Database.getRows ('erabiltzaileak', {'izena': $scope.eremuak.izena}).then (function (emaitza){
        
        if (emaitza.length === 0){
          
          Database.insertRow ('erabiltzaileak', {'izena': $scope.eremuak.izena}).then (function (emaitza){
            
            $uibModalInstance.close ();
            window.location = "#/ipuinak/" + emaitza.insertId;
            
          }, function (error){
            console.log ("ErabiltzaileakCtrl, erabiltzailea sortzerakoan", error);
          });
          
        }
        else
          $scope.errore_mezua = 'Erabiltzailea existitzen da. Ezin da errepikatu.';
        
      }, function (error){
        console.log ("ErabiltzaileakCtrl, erabiltzailea existitzen dela konprobatzen", error);
      });
      
    }
    
  };
  
  $scope.itxi = function () {
    
    $uibModalInstance.dismiss ('itxi');
    
  };

}]);