app.controller('IpuinakCtrl',['$scope', '$route', 'Database', '$uibModal', '$cordovaDialogs', function($scope, $route, Database, $uibModal, $cordovaDialogs){
  
  $scope.erabiltzailea = {};
  $scope.ipuinak = [];
  
  $scope.init = function () {
    
    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        
        // Recogemos los ipuinak del erabiltzaile
        $scope.getIpuinak ();
      }
      else
        window.location = "#/";
      
    }, function (error){
      console.log ("IpuinakCtrl, erabiltzaile datuak jasotzen", error);
    });
    
  };
  
  $scope.getIpuinak = function (){
    
    Database.getRows ('ipuinak', {'fk_erabiltzailea': $scope.erabiltzailea.id}, ' ORDER BY izenburua ASC').then (function (emaitza){
        
      $scope.ipuinak = emaitza;
      
    }, function (error){
      console.log ("IpuinakCtrl, getIpuinak", error);
    });
    
    
  };
  
  $scope.ipuina_datuak = function (ipuina_id){
    
    var modala = $uibModal.open ({
      animation: true,
      templateUrl: 'views/modals/ipuina_datuak.html',
      controller: 'ModalIpuinaDatuakCtrl',
      resolve: {
        erabiltzailea_id: function () {
          return $scope.erabiltzailea.id;
        },
        ipuina_id: function () {
          return ipuina_id;
        }
      }
    });
    
    modala.result.then (function (emaitza){
                
      // Recogemos los ipuinak del erabiltzaile
      $scope.getIpuinak ();
      
    }, function (error){
      console.log ("IpuinakCtrl, ipuin_datuak modala", error);
    });
    
  };
  
  $scope.ipuina_ezabatu = function (ipuina_id){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        // Recogemos las eszenak del ipuina
        Database.getRows ('eszenak', {'fk_ipuina': ipuina_id}, ' ORDER BY timestamp ASC').then (function (eszenak){
          
          angular.forEach (eszenak, function (eszena){
            
            // Empezamos borrando los objetos de la eszena
            Database.deleteRows ('eszena_objektuak', {'fk_eszena': eszena.id}).then (function (){
              
              // Borramos los textos de la eszena
              Database.deleteRows ('eszena_testuak', {'fk_eszena': eszena.id}).then (function (){
              
                // Borramos los datos de la eszena
                Database.deleteRows ('eszenak', {'id': eszena.id}).then (function (){}, function (error){
                  console.log ("IpuinakCtrl, ipuina_ezabatu eszena ezabatzerakoan", error);
                });
                
              }, function (error){
                console.log ("IpuinakCtrl, ipuina_ezabatu eszena_testuak ezabatzerakoan", error);
              });
              
            }, function (error){
              console.log ("IpuinakCtrl, ipuina_ezabatu eszena_objektuak ezabatzerakoan", error);
            });
        
          });
          
          // Borramos los datos del ipuina
          Database.deleteRows ('ipuinak', {'id': ipuina_id}).then (function (){
            
            // Recogemos los ipuinak del erabiltzaile
            $scope.getIpuinak ();
            
          }, function (error){
            console.log ("IpuinakCtrl, ipuina_ezabatu ipuina ezabatzerakoan", error);
          });
          
        }, function (error){
          console.log ("IpuinakCtrl, ipuina_ezabatu eszenak jasotzen", error);
        });
        
      }
      
    }, function (error){
      console.log ("IpuinakCtrl, ipuina_ezabatu dialog", error);
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);