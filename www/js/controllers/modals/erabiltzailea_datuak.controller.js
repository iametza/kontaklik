app.controller('ModalErabiltzaileaDatuakCtrl',['$scope', '$uibModalInstance', '$cordovaDialogs', 'Database', 'Ipuinak', 'erabiltzailea_id', function($scope, $uibModalInstance, $cordovaDialogs, Database, Ipuinak, erabiltzailea_id){
  
  $scope.eremuak = {
    izena: ''
  };
  $scope.submit = false;
  $scope.ezabatu_button = false;
  $scope.errore_mezua = '';
  
  $scope.init = function () {
    
    // Recogemos los datos del erabiltzaile
    Database.query ('SELECT izena FROM erabiltzaileak WHERE id=?', [parseInt (erabiltzailea_id)]).then (function (erabiltzailea){
      
      if (erabiltzailea.length === 1){
        
        $scope.eremuak.izena = erabiltzailea[0].izena;
        $scope.ezabatu_button = true;
        
      }
      
    }, function (error){
      console.log ("ModalErabiltzaileaDatuakCtrl, select erabiltzailea", error);
    });
    
  };
  
  $scope.erabiltzailea_gorde = function (form){
    //console.log ("time", Math.floor(Date.now() / 1000));
    
    $scope.submit = true;
    
    if (form.$valid){
      
      // Comprobamos que no exista el erabiltzaile
      Database.query ('SELECT id FROM erabiltzaileak WHERE izena=? AND id<>?', [$scope.eremuak.izena, erabiltzailea_id]).then (function (emaitza){
        
        if (emaitza.length === 0){
          
          // Guardamos los datos en la base de datos (insertar/modificar)
          if (erabiltzailea_id === 0){
            
            Database.insertRow ('erabiltzaileak', {'izena': $scope.eremuak.izena}).then (function (emaitza){
            
              /*// Cerramos la ventana modal
              $uibModalInstance.close ();
              
              // Desactivamos el control de cambio de estado para poder redireccionar (ver función más abajo)
              $scope.offLocationChangeStart ();
              
              // Redireccionamos a la pantalla con la lista de ipuinak del usuario 
              window.location = "#/ipuinak/" + emaitza.insertId;*/
              
              $uibModalInstance.close (emaitza.insertId);
              
            }, function (error){
              console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea_gorde insert", error);
            });
            
          }
          else{
            
            Database.query ('UPDATE erabiltzaileak SET izena=? WHERE id=?', [$scope.eremuak.izena, erabiltzailea_id]).then (function (){
          
              $uibModalInstance.close (erabiltzailea_id);
              
            }, function (error){
              console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea_gorde update", error);
              $scope.itxi ();
            });
            
          }
          
        }
        else
          $scope.errore_mezua = 'Erabiltzailea existitzen da. Ezin da errepikatu.';
        
      }, function (error){
        console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea existitzen dela konprobatzen", error);
      });
      
    }
    
  };
  
  $scope.erabiltzailea_ezabatu = function (){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        // Recogemos/Borramos los ipuinak del erabiltzaile
        Database.getRows ('ipuinak', {'fk_erabiltzailea': erabiltzailea_id}, '').then (function (ipuinak){
          
          angular.forEach (ipuinak, function (ipuina){
            
            Ipuinak.ezabatu_ipuina (ipuina.id);
            
          });
          
          // Borramos los datos del erabiltzaile
          Database.deleteRows ('erabiltzaileak', {'id': erabiltzailea_id}).then (function (){
            
            $uibModalInstance.close ('ezabatu');
            
          }, function (error){
            console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu erabiltzailea ezabatzerakoan", error);
          });
          
        }, function (error){
          console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu ipuinak jasotzen", error);
        });
        
      }
      
    }, function (error){
      console.log ("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu dialog", error);
    });
    
  };
  
  $scope.itxi = function () {
    
    $uibModalInstance.dismiss ('itxi');
    
  };
  
  // Controlamos el cambio de estado para cerrar la ventana (cuando se da atrás en el botón del sistema)
  $scope.offLocationChangeStart = $scope.$on ('$locationChangeStart', function (event){
    
    event.preventDefault();
    $scope.itxi ();
    
  });
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);