'use strict';
app.controller('IpuinaCtrl',['$scope', '$compile', '$route', 'Kamera', 'Audio', 'Files', 'Database', function($scope, $compile, $route, Kamera, Audio, Files, Database){
  
  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.objektuak = [];
  $scope.fondoak = [];
  
  $scope.init = function () {
    
    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        
        // Recogemos los datos del ipuina
        Database.getRows ('ipuinak', {'fk_erabiltzailea': $scope.erabiltzailea.id, 'id': $route.current.params.ipuina_id}, '').then (function (emaitza){
          
          if (emaitza.length === 1){
            $scope.ipuina = emaitza[0];
            
            // Recogemos las eszenak del ipuina
            Database.getRows ('eszenak', {'fk_ipuina': $scope.ipuina.id}, ' ORDER BY timestamp ASC').then (function (emaitza){
              
              $scope.eszenak = emaitza;
              
              if ($scope.eszenak.length === 0){
                // Creamos una eszena por defecto
                Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id}).then (function (emaitza){
                  // Guardamos la eszena en el array
                  $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id});
                  
                  // Ponemos el fondo en blanco
                  angular.element ('#eszenatoki').css ('background-color', '#fff');
                }, function (error){
                  console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
                });
              }
              else{
                angular.element ('#eszenatoki').css ('background-color', '#fff');
                console.log ("lehen eszenaren datuak kargatu!");
              }
              
            }, function (error){
              console.log ("IpuinaCtrl, ipuina datuak jasotzen", error);
            });
            
            // Recogemos los objektuak
            Database.getRows ('irudiak', {'atala': 'objektua'}, ' ORDER BY timestamp DESC').then (function (irudiak){
              $scope.objektuak = irudiak;
            }, onError);
            
            // Recogemos los fondoak
            Database.getRows ('irudiak', {'atala': 'fondoa'}, ' ORDER BY timestamp DESC').then (function (irudiak){
              $scope.fondoak = irudiak;
            }, onError);
          }
          else
            window.location = "#/ipuinak/" + $scope.erabiltzailea.id;
          
        }, function (error){
          console.log ("IpuinaCtrl, ipuina datuak jasotzen", error);
        });
      }
      else
        window.location = "#/";
      
    }, function (error){
      console.log ("IpuinaCtrl, erabiltzaile datuak jasotzen", error);
    });
    
  };
  
  $scope.$on ("$destroy", function (){
    
    angular.element ('#eszenatoki').css ('background-color', 'transparent');
    angular.element ('#eszenatoki').css ('background', 'none');
    
    angular.element ('.objektua').remove ();
    
    
  });
  
  var onError = function (err) {
    console.log ('err', err);
  };
  
  $scope.addObjektua = function (objektua){
    var objektua = angular.element ('<div objektua="objektua" class="objektua" background="' + objektua.path + '" x="200" y="200"></div>');
    var el = $compile(objektua)($scope);
    
    angular.element ('#eszenatoki').append (objektua);
    
    $scope.insertHere = el;
  };
  
  $scope.addBackground = function (background){
    
    angular.element ('#eszenatoki').css ('background', 'url(' + background.path + ')');
    angular.element ('#eszenatoki').css ('background-size', 'cover');
    
  };
  
  $scope.takeGallery = function (atala){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: Camera.EncodingType.JPEG,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation:true
    };
    
    Kamera.getPicture (options).then (function (irudia){
      
      Database.insertRow ('irudiak', {'path': irudia, 'atala': atala, 'fk_ipuina': $scope.ipuina.id}).then (function (emaitza){
        
        switch (atala){
          case 'objektua': $scope.objektuak.unshift ({'id': emaitza.insertId, 'path': irudia}); break;
          case 'fondoa': $scope.fondoak.unshift ({'id': emaitza.insertId, 'path': irudia}); break;
        }
        
      }, onError);
      
    }, onError);
  };
  
  $scope.takePicture = function (atala){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,     
      saveToPhotoAlbum: true,
      correctOrientation:true
    };
    
    Kamera.getPicture (options).then (function (irudia){
      
      Files.saveFile (irudia).then (function (irudia){
        
        Database.insertRow ('irudiak', {'path': irudia, 'atala': atala, 'fk_ipuina': $scope.ipuina.id}).then (function (emaitza){
          
          switch (atala){
            case 'objektua': $scope.objektuak.unshift ({'id': emaitza.insertId, 'path': irudia}); break;
            case 'fondoa': $scope.fondoak.unshift ({'id': emaitza.insertId, 'path': irudia}); break;
          }
          
        }, onError);
        
      }, onError);
      
    }, onError);
    
  };
  
  $scope.startRecord = function() {
    Audio.startRecord();
  };
  $scope.stopRecord = function(){
    Audio.stopRecord();
  };
  $scope.playRecord = function(){
    Audio.playRecord();
  };
  document.addEventListener('deviceready', function() {
    Audio.stop('sarrera');
  }, false);
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
}]);