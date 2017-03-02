/**
 * @ngdoc overview
 * @name Kontaklik
 * @description
 * # Kontaklik
 *
 * Main module of the application.
 */
var app = angular.module ('Kontaklik', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',   
    'ui.bootstrap',
    'hmTouchEvents',
    'ngCordova',
    'mgo-angular-wizard'
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
      
      /*if (irudiak.length === 0){
        
        // Fondos
        Funtzioak.listDir (cordova.file.applicationDirectory + "www/assets/fondoak/").then (function (fitxategiak){
      
          angular.forEach (fitxategiak, function (fitxategia){
            
            Database.insertRow ('irudiak', {'cordova_file': 'applicationDirectory',
                                'path': 'www/assets/fondoak/',
                                'izena': fitxategia.name,
                                'atala': 'fondoa',
                                'fk_ipuina': 0,
                                'ikusgai': 1}).then (function (){}, function (error){
              console.log ("app.js fondoa gordetzen", error);
            });
            
          });
          
        }, function (error){
          console.log ("app.js fondoak jasotzen", error);
        });
        
        // Objetos
        Funtzioak.listDir (cordova.file.applicationDirectory + "www/assets/objektuak/").then (function (fitxategiak){
      
          angular.forEach (fitxategiak, function (fitxategia){
            
            Database.insertRow ('irudiak', {'cordova_file': 'applicationDirectory',
                                'path': 'www/assets/objektuak/',
                                'izena': fitxategia.name,
                                'atala': 'objektua',
                                'fk_ipuina': 0,
                                'ikusgai': 1}).then (function (){}, function (error){
              console.log ("app.js objektua gordetzen", error);
            });
            
          });
          
        }, function (error){
          console.log ("app.js objektuak jasotzen", error);
        });
        
      }*/
      
    }, function (error){
      console.log ("app.js irudiak jasotzen", error);
    });
    
  }, function (error){
    console.log ("app.js createTables", error);
  });
  
}]);