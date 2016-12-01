'use strict';
app.controller('ErabiltzaileakCtrl',['$scope', 'Database', '$uibModal', '$window', function($scope, Database, $uibModal, $window){
  
  $scope.erabiltzaileak = [];
  
  $scope.init = function () {
    
    // Recogemos los erabiltzaileak
    Database.getRows ('erabiltzaileak', '', ' ORDER BY izena ASC').then (function (emaitza){
      
      $scope.erabiltzaileak = emaitza;
      
    }, function (error){
      console.log ("ErabiltzaileakCtrl, erabiltzaileak jasotzen", error);
    });
    
  };
  
  $scope.modal_ireki_erabiltzaile_berria = function() {
    
    $uibModal.open ({
      animation: true,
      templateUrl: 'views/modals/erabiltzaile_berria.html',
      controller: 'ModalErabiltzaileBerriaCtrl'
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);