app.controller('ModalIpuinBerriaCtrl',['$scope', '$uibModalInstance', 'Database', 'erabiltzailea_id', function($scope, $uibModalInstance, Database, erabiltzailea_id){
  
  $scope.eremuak = {
    izenburua: ''
  };
  $scope.errore_mezua = '';
  
  $scope.ipuin_berria_sortu = function (form){
    //console.log ("time", Math.floor(Date.now() / 1000));
    
    if (form.$valid){
      
      // Comprobamos que no exista el ipuina para el erabiltzaile
      Database.getRows ('ipuinak', {'fk_erabiltzailea': erabiltzailea_id, 'izenburua': $scope.eremuak.izenburua}).then (function (emaitza){
        
        if (emaitza.length === 0){
          
          // Creamos el nuevo ipuina
          Database.insertRow ('ipuinak', {'izenburua': $scope.eremuak.izenburua, 'fk_erabiltzailea': erabiltzailea_id}).then (function (emaitza){
            
            // Cerramos la ventana modal
            $uibModalInstance.close ();
            
            // Desactivamos el control de cambio de estado para poder redireccionar (ver función más abajo)
            $scope.offLocationChangeStart ();
            
            // Redireccionamos a la pantalla del ipuina
            window.location = "#/ipuinak/" + erabiltzailea_id + "/" + emaitza.insertId;
            
          }, function (error){
            console.log ("ModalIpuinBerriaCtrl, ipuina sortzerakoan", error);
          });
          
        }
        else
          $scope.errore_mezua = 'Ipuina existitzen da. Ezin da errepikatu.';
        
      }, function (error){
        console.log ("ModalIpuinBerriaCtrl, ipuina existitzen dela konprobatzen", error);
      });
      
    }
    
  };
  
  $scope.itxi = function () {
    
    $uibModalInstance.dismiss ('itxi');
    
  };
  
  // Controlamos el cambio de estado para cerrar la ventana (cuando se da atrás en el botón del sistema)
  $scope.offLocationChangeStart = $scope.$on ('$locationChangeStart', function (event){
    
    event.preventDefault();
    $scope.itxi ();
    
  });

}]);