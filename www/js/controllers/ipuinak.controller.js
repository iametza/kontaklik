app.controller('IpuinakCtrl',['$scope', '$route', 'Database', '$uibModal', '$uibModalStack', function($scope, $route, Database, $uibModal, $uibModalStack){
  
  $scope.erabiltzailea = {};
  $scope.ipuinak = [];
  
  $scope.init = function () {
    
    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        
        // Recogemos los ipuinak del erabiltzaile
        Database.getRows ('ipuinak', {'fk_erabiltzailea': $scope.erabiltzailea.id}, ' ORDER BY izenburua ASC').then (function (emaitza){
          
          $scope.ipuinak = emaitza;
          
        }, function (error){
          console.log ("IpuinakCtrl, erabiltzailearen ipuinak jasotzen", error);
        });
      }
      else
        window.location = "#/";
      
    }, function (error){
      console.log ("IpuinakCtrl, erabiltzaile datuak jasotzen", error);
    });
    
  };
  
  $scope.modal_ireki_ipuin_berria = function() {
    
    $uibModal.open ({
      animation: true,
      templateUrl: 'views/modals/ipuin_berria.html',
      controller: 'ModalIpuinBerriaCtrl',
      resolve: {
        erabiltzailea_id: function () {
          return $scope.erabiltzailea.id;
        }
      }
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);