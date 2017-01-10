app.controller('ModalEszenaTestuaCtrl',['$scope', '$compile', '$uibModalInstance', '$cordovaDialogs', 'Database', 'eszena_id', 'testua_id', function($scope, $compile, $uibModalInstance, $cordovaDialogs, Database, eszena_id, testua_id){
  
  $scope.eremuak = {
    testua: '',
    fontSize: 16,
    color: '#000',
    borderColor: '#000',
    backgroundColor: '#fff',
    class: ''
  };
  $scope.submit = false;
  $scope.ezabatu_button = false;
  $scope.koloreak = ['#000', '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff'];
  
  $scope.init = function () {
    
    // Recogemos los datos del texto
    Database.query ('SELECT testua, fontSize, color, borderColor, backgroundColor, class, style FROM testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){
      
      if (testua.length === 1){
        
        $scope.eremuak.testua = testua[0].testua;
        $scope.eremuak.fontSize = testua[0].fontSize;
        $scope.eremuak.color = testua[0].color;
        $scope.eremuak.borderColor = testua[0].borderColor;
        $scope.eremuak.backgroundColor = testua[0].backgroundColor;
        $scope.eremuak.class = testua[0].class;
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
        Database.insertRow ('testuak', {'fk_eszena': eszena_id, 'testua': $scope.eremuak.testua, 'fontSize': $scope.eremuak.fontSize, 'color': $scope.eremuak.color, 'borderColor': $scope.eremuak.borderColor, 'backgroundColor': $scope.eremuak.backgroundColor, 'class': $scope.eremuak.class}).then (function (emaitza){
      
          $uibModalInstance.close (emaitza.insertId);
          
        }, function (error){
          console.log ("ModalEszenaTestuaCtrl, testua_gorde insert", error);
          $scope.itxi ();
        });
      }
      else{
        Database.query ('UPDATE testuak SET testua=?, fontSize=?, color=?, borderColor=?, backgroundColor=?, class=? WHERE id=?', [$scope.eremuak.testua, $scope.eremuak.fontSize, $scope.eremuak.color, $scope.eremuak.borderColor, $scope.eremuak.backgroundColor, $scope.eremuak.class, testua_id]).then (function (){
          
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
  
  $scope.aldaketa = function (eremua, kolorea){
    
    switch (eremua){
      case 'color':
        $scope.eremuak.color = kolorea;
        break;
      case 'borderColor':
        $scope.eremuak.borderColor = kolorea;
        break;
      case 'backgroundColor':
        $scope.eremuak.backgroundColor = kolorea;
        break;
    }
    
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