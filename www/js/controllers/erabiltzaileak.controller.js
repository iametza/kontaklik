app.controller('ErabiltzaileakCtrl',['$scope', 'Database', 'Ipuinak', '$uibModal', '$cordovaDialogs', function($scope, Database, Ipuinak, $uibModal, $cordovaDialogs){
  
  $scope.erabiltzaileak = [];
  
  $scope.init = function () {
    
    angular.element ('#eszenatokia').css ('background', "url('assets/backgrounds/background.png') no-repeat center center fixed");
    angular.element ('#eszenatokia').css ('background-size', "cover");
    
    // Recogemos los erabiltzaileak
    $scope.getErabiltzaileak ();
    
  };
  
  $scope.getErabiltzaileak = function (){
    
    Database.getRows ('erabiltzaileak', '', ' ORDER BY izena ASC').then (function (emaitza){
      
      $scope.erabiltzaileak = emaitza;
      
    }, function (error){
      console.log ("ErabiltzaileakCtrl, getErabiltzaileak", error);
    });
    
  };
  
  $scope.erabiltzailea_datuak = function (erabiltzailea_id){
    
    var modala = $uibModal.open ({
      animation: true,
      templateUrl: 'views/modals/erabiltzailea_datuak.html',
      controller: 'ModalErabiltzaileaDatuakCtrl',
      resolve: {
        erabiltzailea_id: function () {
          return erabiltzailea_id;
        }
      }
    });
    
    modala.result.then (function (emaitza){
                
      // Recogemos los erabiltzaileak
      $scope.getErabiltzaileak ();
      
    }, function (error){
      console.log ("ErabiltzaileakCtrl, erabiltzailea_datuak modala", error);
    });
    
  };
  
  $scope.erabiltzailea_ezabatu = function (erabiltzailea_id){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        // Recogemos/Borramos los ipuinak del erabiltzaile
        Database.getRows ('ipuinak', {'fk_erabiltzailea': erabiltzailea_id}, '').then (function (ipuinak){
          
          angular.forEach (ipuinak, function (ipuina){
            
            Ipuinak.ezabatu_ipuina (ipuina.id);
            
          });
          
          // Borramos los datos del erabiltzaile
          Database.deleteRows ('erabiltzaileak', {'id': erabiltzailea_id}).then (function (){
            
            // Recogemos los erabiltzaileak
            $scope.getErabiltzaileak ();
            
          }, function (error){
            console.log ("ErabiltzaileakCtrl, erabiltzailea_ezabatu erabiltzailea ezabatzerakoan", error);
          });
          
        }, function (error){
          console.log ("ErabiltzaileakCtrl, erabiltzailea_ezabatu ipuinak jasotzen", error);
        });
        
      }
      
    }, function (error){
      console.log ("ErabiltzaileakCtrl, erabiltzailea_ezabatu dialog", error);
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);