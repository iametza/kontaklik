app.controller('IpuinaCtrl',['$scope', '$compile', '$route', 'Kamera', 'Audio', 'Files', 'Database', 'Ipuinak', '$cordovaDialogs', '$uibModal', function($scope, $compile, $route, Kamera, Audio, Files, Database, Ipuinak, $cordovaDialogs, $uibModal){
  
  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.eszenak_nabigazioa = {'aurrera': false, 'atzera': false};
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
            $scope.getEszenak ();
            
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
    
    $scope.saveEszena ();
    
    $scope.clearEszena ();
    
  });
  
  $scope.getEszenak = function (){
    
    Database.getRows ('eszenak', {'fk_ipuina': $scope.ipuina.id}, ' ORDER BY orden ASC').then (function (emaitza){
              
      $scope.eszenak = emaitza;
      
      if ($scope.eszenak.length === 0){
        // Creamos una eszena por defecto
        Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'orden': 1}).then (function (emaitza){
          // Limpiamos la eszena por si acaso (si se viene de delEszena puede que haga falta)
          $scope.clearEszena ();
          
          // Ponemos el fondo en blanco
          angular.element ('#eszenatoki').css ('background-color', '#fff');
          
          // Guardamos la eszena en el array
          $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'orden': 1});
          
          $scope.uneko_eszena_id = emaitza.insertId;
          
          $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
        }, function (error){
          console.log ("IpuinaCtrl, getEszenak defektuzko eszena sortzerakoan", error);
        });
      }
      else{
        // Cargamos la primera eszena
        $scope.changeEszena ($scope.eszenak[0]);
        
        $scope.uneko_eszena_id = $scope.eszenak[0].id;
        $scope.eszenak_nabigazioa.aurrera = false;
        $scope.eszenak_nabigazioa.atzera = ($scope.eszenak.length > 1);
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, getEszenak ipuina datuak jasotzen", error);
    });
    
  };
  
  $scope.clearEszena = function (){
    
    // Quitamos el fondo
    angular.element ('#eszenatoki').css ('background-color', 'transparent');
    angular.element ('#eszenatoki').css ('background', 'none');
    
    // Quitamos los objetos
    angular.element ('.objektua').remove ();
    
    // Quitamos los textos
    angular.element ('.testua').remove ();
    
  };
  
  $scope.saveEszena = function (){
    
    $scope.eszenarenObjektuakGorde ();
    
    $scope.eszenarenTestuakGorde ();
    
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
        
        if (objektua[0].style !== null){
          
          var style_object = JSON.parse (objektua[0].style);
          
          // Sacamos la scale y el rotate del objeto para pasársela a la directiva
          //console.log (style_object.transform);
          //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;
          
          if (style_object.transform.match (patroia_xy)){
            elem.attr ('x', style_object.transform.replace (patroia_xy, "$1"));
            elem.attr ('y', style_object.transform.replace (patroia_xy, "$2"));
          }
          
          if (style_object.transform.match (patroia_scale))
            elem.attr ('scale', style_object.transform.replace (patroia_scale, "$1"));
            
          if (style_object.transform.match (patroia_rotate))
            elem.attr ('rotate', style_object.transform.replace (patroia_rotate, "$1"));
            
          // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
          el = $compile(elem)($scope);
          
          elem.children ().css (style_object);
          
        }
        else
          el = $compile(elem)($scope);
        
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
    
    Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'orden': $scope.eszenak.length+1}).then (function (emaitza){
      // Guardamos la eszena en el array
      $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'orden': $scope.eszenak.length+1});
      
      // Guardamos y limpiamos la eszena anterior
      $scope.saveEszena ();
      $scope.clearEszena ();
      
      // Ponemos el fondo en blanco
      angular.element ('#eszenatoki').css ('background-color', '#fff');
      
      $scope.uneko_eszena_id = emaitza.insertId;
      
      $scope.eszenak_nabigazioa.aurrera = true;
      $scope.eszenak_nabigazioa.atzera = false;
    }, function (error){
      console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
    
  };
  
  $scope.delEszena = function (){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        Ipuinak.ezabatu_eszena ($scope.uneko_eszena_id).then (function (){
          
          // Recogemos las eszenak que queden del ipuina
          $scope.getEszenak ();
          
        }, function (error){
          console.log ("IpuinaCtrl, delEszena", error);
        });
        
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, delEszena confirm", error);
    });
    
  };
  
  $scope.changeFondoa = function (fondoa){
    
    angular.element ('#eszenatoki').css ('background', 'url(' + fondoa.path + ')');
    angular.element ('#eszenatoki').css ('background-size', 'cover');
    
  };
  
  $scope.changeEszena = function (eszena){
    
    // Guardamos el estado actual de los objetos y textos de la eszena actual
    $scope.saveEszena ();
    
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
      Database.getRows ('eszena_objektuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (objektuak){
        
        angular.forEach (objektuak, function (objektua){
          $scope.objektuaEszenara (objektua.id);
        });
        
      }, onError);
      
      // Cargamos sus textos
      Database.getRows ('eszena_testuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (testuak){
        
        angular.forEach (testuak, function (testua){
          $scope.testuaEszenara (testua.id);
        });
        
      }, onError);
      
      $scope.uneko_eszena_id = eszena.id;
      
      // Eszenen nabigazioa eguneratu (aurrera eta atzera botoiak aktibo bai/ez)
      for (var ind = 0; ind < $scope.eszenak.length; ind++){
        
        if ($scope.eszenak[ind].id == eszena.id)
          break;
        
      }
      
      $scope.eszenak_nabigazioa.aurrera = (ind > 0);
      $scope.eszenak_nabigazioa.atzera = (ind < $scope.eszenak.length-1);
      
    }, function (error){
      console.log ("IpuinaCtrl, ipuina datuak jasotzen", error);
    });
    
  };
  
  $scope.eszenarenObjektuakGorde = function (){
    
    angular.forEach (angular.element ('.objektua'), function (objektua){
      
      var elem = angular.element (objektua);
      var id = parseInt (elem.attr ('data-eo-id'));
      var style = JSON.stringify (elem[0].children[0].style);
      
      //console.log ("eszenarenObjektuakGorde", elem[0].children[0].style.transform);
      
      Database.query ('UPDATE eszena_objektuak SET style=? WHERE id=?', [style, id]).then (function (){
        //console.log ("objektuaren egoera aldatua!", id, style);
      }, function (error){
        console.log ("IpuinaCtrl, eszenarenObjektuakGorde", error);
      });
      
    });
    
  };
  
  $scope.addTestua = function (){
    
    var modala = $uibModal.open ({
      animation: true,
      templateUrl: 'views/modals/eszena_testua.html',
      controller: 'ModalEszenaTestuaCtrl',
      resolve: {
        eszena_id: $scope.uneko_eszena_id,
        testua_id: 0
      }
    });
    
    modala.result.then (function (testua_id){
      
      $scope.testuaEszenara (testua_id);
      
    }, function (error){
      console.log ("IpuinaCtrl, addTestua", error);
    });
                 
  };
  
  $scope.testuaEszenara = function (testua_id){
    
    Database.query ('SELECT testua, style FROM eszena_testuak WHERE id=?', [testua_id]).then (function (testua){
      
      if (testua.length === 1){
        var elem = angular.element ('<div testua="testua" class="testua" data-testua-id="' + testua_id + '" x="200" y="200"></div>');
        
        if (testua[0].style !== null){
          
          var style_object = JSON.parse (testua[0].style);
          
          // Sacamos la scale y el rotate del objeto para pasársela a la directiva
          //console.log (style_object.transform);
          //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;
          
          if (style_object.transform.match (patroia_xy)){
            elem.attr ('x', style_object.transform.replace (patroia_xy, "$1"));
            elem.attr ('y', style_object.transform.replace (patroia_xy, "$2"));
          }
          
          if (style_object.transform.match (patroia_scale))
            elem.attr ('scale', style_object.transform.replace (patroia_scale, "$1"));
            
          if (style_object.transform.match (patroia_rotate))
            elem.attr ('rotate', style_object.transform.replace (patroia_rotate, "$1"));
            
          // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
          el = $compile(elem)($scope);
          
          elem.children ().css (style_object);
          
        }
        else
          el = $compile(elem)($scope);
        
        angular.element ('#eszenatoki').append (elem);
        $scope.insertHere = el;
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, testuaEszenara SELECT", error);
    });
    
  };
  
  $scope.eszenarenTestuakGorde = function (){
    
    angular.forEach (angular.element ('.testua'), function (testua){
      
      var elem = angular.element (testua);
      var id = parseInt (elem.attr ('data-testua-id'));
      var style = JSON.stringify (elem[0].children[0].style);
      
      Database.query ('UPDATE eszena_testuak SET style=? WHERE id=?', [style, id]).then (function (){
        //console.log ("testuaren egoera aldatua!", id, style);
      }, function (error){
        console.log ("IpuinaCtrl, eszenarenTestuakGorde", error);
      });
      
    });
    
  };
  
  $scope.eszenaAurreratu = function (){
    
    if ($scope.eszenak_nabigazioa.aurrera){
    
      for (var ind = 0; ind < $scope.eszenak.length; ind++){
        
        if ($scope.eszenak[ind].id == $scope.uneko_eszena_id)
          break;
        
      }
      
      if (ind > 0){
            
        // Cambiamos el orden del elemento en la base de datos
        Database.query ('UPDATE eszenak SET orden=orden-1 WHERE id=?', [$scope.eszenak[ind].id]).then (function (){
          
          // Cambiamos el orden del elemento anterior en la base de datos
          Database.query ('UPDATE eszenak SET orden=orden+1 WHERE id=?', [$scope.eszenak[ind-1].id]).then (function (){
          
            // Cambiamos el orden de los elementos en la lista y la reordenamos
            $scope.eszenak[ind].orden--;
            $scope.eszenak[ind-1].orden++;
            
            var temp = $scope.eszenak[ind];
            $scope.eszenak[ind] = $scope.eszenak[ind-1];
            $scope.eszenak[ind-1] = temp;
            
            $scope.eszenak_nabigazioa.aurrera = (ind-1 > 0);
            $scope.eszenak_nabigazioa.atzera = true;
        
          }, function (error){
            console.log ("IpuinaCtrl, eszenaAurreratu second update", error);
          });
          
        }, function (error){
          console.log ("IpuinaCtrl, eszenaAurreratu first update", error);
        });
        
      }
      
    }
    
  };
  
  $scope.eszenaAtzeratu = function (){
    
    if ($scope.eszenak_nabigazioa.atzera){
    
      for (var ind = 0; ind < $scope.eszenak.length; ind++){
        
        if ($scope.eszenak[ind].id == $scope.uneko_eszena_id)
          break;
        
      }
      
      if (ind < ($scope.eszenak.length-1)){
            
        // Cambiamos el orden del elemento en la base de datos
        Database.query ('UPDATE eszenak SET orden=orden+1 WHERE id=?', [$scope.eszenak[ind].id]).then (function (){
          
          // Cambiamos el orden del elemento siguiente en la base de datos
          Database.query ('UPDATE eszenak SET orden=orden-1 WHERE id=?', [$scope.eszenak[ind+1].id]).then (function (){
          
            // Cambiamos el orden de los elementos en la lista y la reordenamos
            $scope.eszenak[ind].orden++;
            $scope.eszenak[ind+1].orden--;
            
            var temp = $scope.eszenak[ind];
            $scope.eszenak[ind] = $scope.eszenak[ind+1];
            $scope.eszenak[ind+1] = temp;
            
            $scope.eszenak_nabigazioa.aurrera = true;
            $scope.eszenak_nabigazioa.atzera = (ind+1 < $scope.eszenak.length-1);
        
          }, function (error){
            console.log ("IpuinaCtrl, eszenaAtzeratu second update", error);
          });
          
        }, function (error){
          console.log ("IpuinaCtrl, eszenaAtzeratu first update", error);
        });
        
      }
      
    }
    
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