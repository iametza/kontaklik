/**
 * @ngdoc overview
 * @name haziakApp
 * @description
 * # haziakApp
 *
 * Main module of the application.
 */
var app = angular.module ('haziakApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',   
    'ui.bootstrap',
    'hmTouchEvents',
    'ngCordova'
  ])
  .config (function ($routeProvider){
    $routeProvider
      .when ('/', {
        templateUrl: 'views/erabiltzaileak.html',
        controller: 'ErabiltzaileakCtrl'
      })
      .when ('/ipuinak/:erabiltzailea_id', {
        templateUrl: 'views/ipuinak.html',
        controller: 'IpuinakCtrl'
      })
      .when ('/ipuinak/:erabiltzailea_id/:ipuina_id', {
        templateUrl: 'views/ipuina.html',
        controller: 'IpuinaCtrl'
      })
      .otherwise ({
        redirectTo: '/'
      });
})
.run (['Database', 'Funtzioak', function (Database, Funtzioak){
  //Database.dropTables ();
  Database.createTables ().then (function (){
    
    // Si no hay 'irudiak' cargamos los fondos y objetos por defecto
    Database.getRows ('irudiak', {}, '').then (function (irudiak){
      
      if (irudiak.length === 0){
        
        // Fondos
        Funtzioak.listDir (cordova.file.applicationDirectory + "www/assets/fondoak/").then (function (fitxategiak){
      
          angular.forEach (fitxategiak, function (fitxategia){
            
            Database.insertRow ('irudiak', {'path': fitxategia.nativeURL, 'atala': 'fondoa', 'fk_ipuina': 0}).then (function (){}, function (error){
              console.log ("app.js fondoa gordetzen", error);
            });
            
          });
          
        }, function (error){
          console.log ("app.js fondoak jasotzen", error);
        });
        
        // Objetos
        Funtzioak.listDir (cordova.file.applicationDirectory + "www/assets/objektuak/").then (function (fitxategiak){
      
          angular.forEach (fitxategiak, function (fitxategia){
            
            Database.insertRow ('irudiak', {'path': fitxategia.nativeURL, 'atala': 'objektua', 'fk_ipuina': 0}).then (function (){}, function (error){
              console.log ("app.js objektua gordetzen", error);
            });
            
          });
          
        }, function (error){
          console.log ("app.js objektuak jasotzen", error);
        });
        
      }
      
    }, function (error){
      console.log ("app.js irudiak jasotzen", error);
    });
    
  }, function (error){
    console.log ("app.js createTables", error);
  });
  
  /*Funtzioak.baimenak_txek ().then (function (egoera){
    console.log ("baimenak", egoera);
  }, function (error){
    console.log ("app.js baimenak_txek", error);
  });*/
  
}]);