app.controller('IpuinaCtrl',['$scope', '$compile', '$route', 'Kamera', 'Audio', 'Files', 'Database', function($scope, $compile, $route, Kamera, Audio, Files, Database){
  
  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.objektuak = [];
  $scope.fondoak = [];
  $scope.uneko_eszena_id = 0;
  
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
                Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0}).then (function (emaitza){
                  // Guardamos la eszena en el array
                  $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0});
                  
                  // Ponemos el fondo en blanco
                  angular.element ('#eszenatoki').css ('background-color', '#fff');
                  
                  $scope.uneko_eszena_id = emaitza.insertId;
                }, function (error){
                  console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
                });
              }
              else{
                // Cargamos la primera eszena
                $scope.changeEszena ($scope.eszenak[0]);
                
                $scope.uneko_eszena_id = $scope.eszenak[0].id;
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
    
    $scope.eszenarenObjektuakGorde ();
    
    $scope.clearEszena ();
    
  });
  
  $scope.clearEszena = function (){
    
    angular.element ('#eszenatoki').css ('background-color', 'transparent');
    angular.element ('#eszenatoki').css ('background', 'none');
    
    angular.element ('.objektua').remove ();
    
  };
  
  $scope.addObjektua = function (objektua){
    
    // Guardamos la relación en la base de datos y creamos el objeto
    Database.insertRow ('eszena_objektuak', {'fk_eszena': $scope.uneko_eszena_id, 'fk_objektua': objektua.id}).then (function (emaitza){
      
      $scope.objektuaEszenara (emaitza.insertId);
      
    }, function (error){
      console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
    
  };
  
  $scope.objektuaEszenara = function (eszena_objektua_id){
    
    Database.query ('SELECT i.path, eo.style FROM eszena_objektuak eo INNER JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [eszena_objektua_id]).then (function (objektua){
      
      if (objektua.length === 1){
        var elem = angular.element ('<div objektua="objektua" class="objektua" data-eo-id="' + eszena_objektua_id + '" background="' + objektua[0].path + '" x="200" y="200"></div>');
        var el = $compile(elem)($scope);
        
        if (objektua[0].style !== null){
          var style_object = JSON.parse (objektua[0].style);
          // Aplicamos todas las propiedades que tenga
          /*angular.forEach (style_object, function (balioa, gakoa){
            
            if (elem[0].children[0].style.hasOwnProperty (gakoa))
              elem[0].children[0].style[gakoa] = balioa;
              
          });*/
          
          elem.children ().css (style_object);
          
        }
        
        //console.log ("objektuaEszenara", elem.children());
        
        angular.element ('#eszenatoki').append (elem);
        
        $scope.insertHere = el;
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, objektuaEszenara", error);
    });
    
  };
  
  $scope.addFondoa = function (fondoa){
    
    // Cambiamos el fondo
    $scope.changeFondoa (fondoa);
    
    // Guardamos el fondo en la base de datos
    Database.query ('UPDATE eszenak SET fk_fondoa=? WHERE id=?', [fondoa.id, $scope.uneko_eszena_id]).then (function (){
      
      // Cambiamos el fondo en la lista
      angular.forEach ($scope.eszenak, function (eszena){
        
        if (eszena.id === $scope.uneko_eszena_id)
          eszena.fk_fondoa = fondoa.id;
          
      });
      
    }, function (error){
      console.log ("IpuinaCtrl, fondoa datu basean aldatzen", error);
    });
    
  };
  
  $scope.addEszena = function (){
    
    Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0}).then (function (emaitza){
      // Guardamos la eszena en el array
      $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0});
      
      // Limpiamos la eszena anterior
      $scope.clearEszena ();
      
      // Ponemos el fondo en blanco
      angular.element ('#eszenatoki').css ('background-color', '#fff');
      
      $scope.uneko_eszena_id = emaitza.insertId;
    }, function (error){
      console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
    
  };
  
  $scope.changeFondoa = function (fondoa){
    
    angular.element ('#eszenatoki').css ('background', 'url(' + fondoa.path + ')');
    angular.element ('#eszenatoki').css ('background-size', 'cover');
    
  };
  
  $scope.changeEszena = function (eszena){
    
    // Guardamos el estado actual de los objetos de la eszena actual
    $scope.eszenarenObjektuakGorde ();
    
    // Empezamos con el fondo
    Database.getRows ('irudiak', {'atala': 'fondoa', 'id': eszena.fk_fondoa}, '').then (function (emaitza){
      
      // Limpiamos la eszena anterior
      $scope.clearEszena ();
      
      if (emaitza.length === 1){
        $scope.changeFondoa (emaitza[0]);
      }
      else{
        angular.element ('#eszenatoki').css ('background-color', '#fff');
      }
      
      // Cargamos sus objetos
      //Database.query ('SELECT eo.id, i.path FROM eszena_objektuak eo INNER JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.fk_eszena=? ORDER BY eo.id ASC', [eszena.id]).then (function (objektuak){
      Database.getRows ('eszena_objektuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (objektuak){
        
        angular.forEach (objektuak, function (objektua){
          $scope.objektuaEszenara (objektua.id);
        });
        
      }, onError);
      
      
      $scope.uneko_eszena_id = eszena.id;
      
    }, function (error){
      console.log ("IpuinaCtrl, ipuina datuak jasotzen", error);
    });
    
  };
  
  $scope.eszenarenObjektuakGorde = function (){
    
    angular.forEach (angular.element ('.objektua'), function (objektua){
      
      var elem = angular.element (objektua);
      var id = parseInt (elem.attr ('data-eo-id'));
      var style = JSON.stringify (elem[0].children[0].style);
      
      //console.log ("eszenarenObjektuakGorde", elem);
      
      Database.query ('UPDATE eszena_objektuak SET style=? WHERE id=?', [style, id]).then (function (){
        //console.log ("objektuaren egoera aldatua!", id, style);
      }, function (error){
        console.log ("IpuinaCtrl, eszenarenObjektuakGorde", error);
      });
      
    });
    
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
  
  var onError = function (err) {
    console.log ('err', err);
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
}]);