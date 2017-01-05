app.controller('ModalEszenaTestuaCtrl',['$scope', '$compile', '$uibModalInstance', '$cordovaDialogs', 'Database', 'eszena_id', 'testua_id', function($scope, $compile, $uibModalInstance, $cordovaDialogs, Database, eszena_id, testua_id){
  
  $scope.eremuak = {
    testua: ''
  };
  $scope.submit = false;
  $scope.ezabatu_button = false;
  
  $scope.init = function () {
    
    // Recogemos los datos del texto
    Database.query ('SELECT testua FROM testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){
      
      if (testua.length === 1){
        
        $scope.eremuak.testua = testua[0].testua;
        $scope.ezabatu_button = true;
        
      }
      
    }, function (error){
      console.log ("ModalEszenaTestuaCtrl, select testua", error);
    });
    
  };
  
  $scope.testua_gorde = function (form){
    
    $scope.submit = true;
    
    if (form.$valid){
      
      // Guardamos los datos en la base de datos (insertar/modificar)
      if (testua_id === 0){
        Database.insertRow ('testuak', {'fk_eszena': eszena_id, 'testua': $scope.eremuak.testua}).then (function (emaitza){
      
          $uibModalInstance.close (emaitza.insertId);
          
        }, function (error){
          console.log ("ModalEszenaTestuaCtrl, testua_gorde insert", error);
          $scope.itxi ();
        });
      }
      else{
        Database.query ('UPDATE testuak SET testua=? WHERE id=?', [$scope.eremuak.testua, testua_id]).then (function (){
          
          // Cambiamos el texto en la escena AHORA SE HACE EN testua.directive.js
          /*var elementua = angular.element.find ('div[data-testua-id="' + testua_id + '"]');
          angular.element (elementua).children ().html (Funtzioak.nl2br ($scope.eremuak.testua));*/
      
          $uibModalInstance.close (testua_id);
          
        }, function (error){
          console.log ("ModalEszenaTestuaCtrl, testua_gorde update", error);
          $scope.itxi ();
        });
      }
      
    }
    
  };
  
  $scope.testua_ezabatu = function (){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        Database.query ('DELETE FROM testuak WHERE id=?', [parseInt (testua_id)]).then (function (){
          
          // Borramos el objeto de la escena AHORA SE HACE EN testua.directive.js
          /*var elementua = angular.element.find ('div[data-testua-id="' + testua_id + '"]');
          angular.element (elementua).remove ();*/
          
          $uibModalInstance.close ('ezabatu');
          
        }, function (error){
          console.log ("Testua directive DELETE", error);
        });
        
      }
      
    }, function (error){
      console.log ("Objektua directive onPress", error);
    });
    
  };
  
  $scope.itxi = function (){
    
    $uibModalInstance.dismiss ('itxi');
    
  };
  
  $scope.$on ('$locationChangeStart', function (event){
    
    event.preventDefault();
    $scope.itxi ();
    
  });
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });

}]);