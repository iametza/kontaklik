'use strict';
app.controller('IpuinakCtrl',['$scope', '$route', 'Database', function($scope, $route, Database){
  
  $scope.erabiltzailea = {};
  
  $scope.init = function () {
    
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1)
        $scope.erabiltzailea = emaitza[0];
      else
        console.log ("IpuinakCtrl, erabiltzaile datuak jasotzen II", emaitza);
      
    }, function (error){
      console.log ("IpuinakCtrl, erabiltzaile datuak jasotzen", error);
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);