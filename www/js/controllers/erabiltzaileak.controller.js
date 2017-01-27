app.controller('ErabiltzaileakCtrl',['$scope', 'Database', '$uibModal', function($scope, Database, $uibModal){
  
  $scope.erabiltzaileak = [];
  
  $scope.init = function () {
    
    angular.element ('#eszenatokia').css ('background', "url('images/fondoa.jpg') no-repeat center center fixed");
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
    
    modala.result.then (function (){
                
      // Recogemos los erabiltzaileak
      $scope.getErabiltzaileak ();
      
    }, function (error){
      console.log ("ErabiltzaileakCtrl, erabiltzailea_datuak modala", error);
    });
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);