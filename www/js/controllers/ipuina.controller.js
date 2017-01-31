app.controller('IpuinaCtrl',['$scope', '$compile', '$route', 'Kamera', 'Audio', 'Files', 'Database', 'Ipuinak', '$cordovaDialogs', '$uibModal', '$cordovaFile', '$timeout', '$interval', function($scope, $compile, $route, Kamera, Audio, Files, Database, Ipuinak, $cordovaDialogs, $uibModal, $cordovaFile, $timeout, $interval){
  
  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.eszenak_nabigazioa = {'aurrera': false, 'atzera': false};
  $scope.objektuak = [];
  $scope.fondoak = [];
  $scope.uneko_eszena_id = 0;
  $scope.uneko_audioa = {'izena': '', 'iraupena': 0, 'counter': 0};
  $scope.menuaCollapsed = false;
  $scope.kontador = undefined;
  $scope.bideo_modua = {'playing': false, 'interval': undefined};
  
  $scope.init = function (){
    
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
  
  $scope.getEszenak = function (){
    
    Database.query ("SELECT e.*, ifnull(i.path, '') path FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [$scope.ipuina.id]).then (function (emaitza){
              
      $scope.eszenak = emaitza;
      
      if ($scope.eszenak.length === 0){
        // Creamos una eszena por defecto
        Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'audioa': '', 'orden': 1}).then (function (emaitza){
          // Limpiamos la eszena por si acaso (si se viene de borrar una eszena, por ejemplo, puede que haga falta)
          $scope.clearEszena ();
          
          // Ponemos el fondo en blanco
          angular.element ('#eszenatokia').css ('background-color', '#fff');
          
          // Guardamos la eszena en el array
          $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'path': '', 'audioa': '', 'orden': 1});
          
          $scope.uneko_eszena_id = emaitza.insertId;
          
          $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
          
          $scope.uneko_audioa.izena = '';
          $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
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
    angular.element ('#eszenatokia').css ('background-color', 'transparent');
    angular.element ('#eszenatokia').css ('background', 'none');
    
    // Quitamos los objetos
    angular.element ('.objektua').remove ();
    
    // Quitamos los textos
    angular.element ('.testua').remove ();
    
  };
  
  $scope.addObjektua = function (objektua){
    
    // Guardamos la relación en la base de datos y creamos el objeto
    Database.insertRow ('eszena_objektuak', {'fk_eszena': $scope.uneko_eszena_id, 'fk_objektua': objektua.id}).then (function (emaitza){
      
      $scope.objektuaEszenara (emaitza.insertId);
      
    }, function (error){
      console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
    
  };
  
  $scope.objektuaEszenara = function (eszena_objektua_id, lock){
    lock = typeof lock !== 'undefined' ? lock : false;
    
    Database.query ('SELECT i.path, eo.style FROM eszena_objektuak eo INNER JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [eszena_objektua_id]).then (function (objektua){
      
      if (objektua.length === 1){
        var elem = angular.element ('<div objektua="objektua" class="objektua" data-eo-id="' + eszena_objektua_id + '" data-src="' + objektua[0].path + '" data-lock="' + lock + '"></div>');
        
        if (objektua[0].style !== null){
          
          var style_object = JSON.parse (objektua[0].style);
          
          // Sacamos la scale y el rotate del objeto para pasársela a la directiva
          //console.log (style_object.transform);
          //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;
          
          if (style_object.transform.match (patroia_xy)){
            elem.attr ('data-x', style_object.transform.replace (patroia_xy, "$1"));
            elem.attr ('data-y', style_object.transform.replace (patroia_xy, "$2"));
          }
          
          if (style_object.transform.match (patroia_scale))
            elem.attr ('data-scale', style_object.transform.replace (patroia_scale, "$1"));
            
          if (style_object.transform.match (patroia_rotate))
            elem.attr ('data-rotate', style_object.transform.replace (patroia_rotate, "$1"));
            
          // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
          el = $compile(elem)($scope);
          
          elem.children ().css (style_object);
          
        }
        else
          el = $compile(elem)($scope);
        
        angular.element ('#eszenatokia').append (elem);
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
        
        if (eszena.id === $scope.uneko_eszena_id){
          eszena.fk_fondoa = fondoa.id;
          eszena.path = fondoa.path;
        }
          
      });
      
    }, function (error){
      console.log ("IpuinaCtrl, fondoa datu basean aldatzen", error);
    });
    
  };
  
  $scope.addEszena = function (){
    
    Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'audioa': '', 'orden': $scope.eszenak.length+1}).then (function (emaitza){
      // Guardamos la eszena en el array
      $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'path': '', 'audioa': '', 'orden': $scope.eszenak.length+1});
      
      // Limpiamos la eszena anterior
      $scope.clearEszena ();
      
      // Ponemos el fondo en blanco
      angular.element ('#eszenatokia').css ('background-color', '#fff');
      
      $scope.uneko_eszena_id = emaitza.insertId;
      
      $scope.eszenak_nabigazioa.aurrera = true;
      $scope.eszenak_nabigazioa.atzera = false;
      
      $scope.uneko_audioa.izena = '';
      $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
    }, function (error){
      console.log ("IpuinaCtrl, addEszena", error);
    });
    
  };
  
  $scope.pressEszena = function (eszena_id){
    
    $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
      
      if (buttonIndex == 1){
        
        Ipuinak.ezabatu_eszena (eszena_id).then (function (){
          
          Ipuinak.eszenak_ordenatu ($route.current.params.ipuina_id).then (function (){
            
            // Recogemos las eszenak que queden del ipuina
            $scope.getEszenak ();
            
          }, function (error){
            console.log ("IpuinaCtrl, pressEszena eszenak_ordenatu", error);
          });
          
        }, function (error){
          console.log ("IpuinaCtrl, pressEszena ezabatu_eszena", error);
        });
        
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, pressEszena confirm", error);
    });
    
  };
  
  $scope.changeFondoa = function (fondoa){
    
    angular.element ('#eszenatokia').css ('background', 'url(' + fondoa.path + ')');
    //angular.element ('#eszenatokia').css ('background-size', 'cover');
    angular.element ('#eszenatokia').css ('background-size', '100% 100%');
    
  };
  
  $scope.changeEszena = function (eszena, lock){
    lock = typeof lock !== 'undefined' ? lock : false;
    
    // Empezamos con el fondo
    Database.getRows ('irudiak', {'atala': 'fondoa', 'id': eszena.fk_fondoa}, '').then (function (emaitza){
      
      // Limpiamos la eszena anterior
      $scope.clearEszena ();
      
      if (emaitza.length === 1){
        $scope.changeFondoa (emaitza[0]);
      }
      else{
        angular.element ('#eszenatokia').css ('background-color', '#fff');
      }
      
      // Cargamos sus objetos
      Database.getRows ('eszena_objektuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (objektuak){
        
        angular.forEach (objektuak, function (objektua){
          $scope.objektuaEszenara (objektua.id, lock);
        });
        
      }, onError);
      
      // Cargamos sus textos
      Database.getRows ('eszena_testuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (testuak){
        
        angular.forEach (testuak, function (testua){
          $scope.testuaEszenara (testua.id, lock);
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
      
      $scope.uneko_audioa.izena = eszena.audioa;
      Audio.getDuration (eszena.audioa).then (function (iraupena){
        $scope.uneko_audioa.iraupena = iraupena;
      }, function (){
        $scope.uneko_audioa.iraupena = 0;
      });
      $scope.uneko_audioa.counter = 0;
      
    }, function (error){
      console.log ("IpuinaCtrl, ipuina datuak jasotzen", error);
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
  
  $scope.testuaEszenara = function (testua_id, lock){
    lock = typeof lock !== 'undefined' ? lock : false;
    
    Database.query ('SELECT testua, style FROM eszena_testuak WHERE id=?', [testua_id]).then (function (testua){
      
      if (testua.length === 1){
        var elem = angular.element ('<div testua="testua" class="testua" data-testua-id="' + testua_id + '" data-lock="' + lock + '"></div>');
        
        if (testua[0].style !== null){
          
          var style_object = JSON.parse (testua[0].style);
          
          // Sacamos la scale y el rotate del objeto para pasársela a la directiva
          //console.log (style_object.transform);
          //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;
          
          if (style_object.transform.match (patroia_xy)){
            elem.attr ('data-x', style_object.transform.replace (patroia_xy, "$1"));
            elem.attr ('data-y', style_object.transform.replace (patroia_xy, "$2"));
          }
          
          if (style_object.transform.match (patroia_scale))
            elem.attr ('data-scale', style_object.transform.replace (patroia_scale, "$1"));
            
          if (style_object.transform.match (patroia_rotate))
            elem.attr ('data-rotate', style_object.transform.replace (patroia_rotate, "$1"));
            
          // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
          el = $compile(elem)($scope);
          
          elem.children ().css (style_object);
          
        }
        else
          el = $compile(elem)($scope);
        
        angular.element ('#eszenatokia').append (elem);
        $scope.insertHere = el;
      }
      
    }, function (error){
      console.log ("IpuinaCtrl, testuaEszenara SELECT", error);
    });
    
  };
  
  $scope.eszenaAurreratu = function (){
    
    if ($scope.eszenak_nabigazioa.aurrera){
      
      // bloqueamos la navegación para que no se cuelen otras peticiones
      $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
    
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
      
      // bloqueamos la navegación para que no se cuelen otras peticiones
      $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
    
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
  
  $scope.menuaCollapse = function (){
    
    $scope.menuaCollapsed = !$scope.menuaCollapsed;
    
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
  
  $scope.audioa_startRecord = function (){
    
    $scope.kontador = $timeout ($scope.time_counter, 1000);
    
    Audio.startRecord ('audioa_' + $scope.uneko_eszena_id).then (function (audioa){
      
      $timeout.cancel ($scope.kontador);
      
      // Mover desde la carpeta temporal a una persistente
      $cordovaFile.moveFile (audioa.path, audioa.izena, cordova.file.dataDirectory, audioa.izena).then (function (){
        
        // Guardamos el audio en la base de datos
        Database.query ('UPDATE eszenak SET audioa=? WHERE id=?', [audioa.izena, $scope.uneko_eszena_id]).then (function (){
          
          // Cambiamos el audio en la lista
          angular.forEach ($scope.eszenak, function (eszena){
            
            if (eszena.id === $scope.uneko_eszena_id)
              eszena.audioa = audioa.izena;
              
          });
          
          $scope.uneko_audioa.izena = audioa.izena;
          Audio.getDuration (audioa.izena).then (function (iraupena){
            $scope.uneko_audioa.iraupena = iraupena;
          }, function (){
            $scope.uneko_audioa.iraupena = 0;
          });
          $scope.uneko_audioa.counter = 0;
          
        }, function (error){
          console.log ("IpuinaCtrl, startRecord update", error);
        });
        
      }, function (error){
        console.log ("IpuinaCtrl, startRecord movefile", error);
      });

    }, function (error){
      $timeout.cancel ($scope.kontador);
      console.log ("IpuinaCtrl, startRecord", error);
    });
    
  };
  
  $scope.time_counter = function (){
    
    $scope.uneko_audioa.counter++;
    $scope.kontador = $timeout ($scope.time_counter, 1000);
    
  };
  
  $scope.audioa_stopRecord = function (){
    
    Audio.stopRecord ();
    
  };
  
  $scope.audioa_play = function (){
    
    if ($scope.uneko_audioa.izena !== ''){
      
      if (Audio.egoera () == 'stopped' || Audio.egoera () == 'paused'){
        
        $scope.kontador = $timeout ($scope.time_counter, 1000);
      
        Audio.play ($scope.uneko_audioa.izena).then (function (){
          
          $timeout.cancel ($scope.kontador);
          $scope.uneko_audioa.counter = 0;
          
        }, function (error){
          $timeout.cancel ($scope.kontador);
          console.log ("IpuinaCtrl, startRecord", error);
        });
        
      }
      
    }
    
  };
  
  $scope.audioa_pause = function (){
    
    if (Audio.egoera () == 'playing'){
      
      Audio.pause ();
      
      if ($scope.kontador !== undefined)
        $timeout.cancel ($scope.kontador);
      
    }
    
  };
  
  $scope.audioa_stop = function (){
    
    Audio.stop ();
    
    if ($scope.kontador !== undefined){
      $timeout.cancel ($scope.kontador);
      $scope.uneko_audioa.counter = 0;
    }
    
  };
  
  $scope.audioa_delete = function (){
    
    if ($scope.uneko_audioa.izena !== ''){
      
      // Puede que se esté reprodcuciendo en éste momento...
      $scope.audioa_kill ();
      
      $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
        
        if (buttonIndex == 1){
          
          // Borramos el fichero
          $cordovaFile.removeFile (cordova.file.dataDirectory, $scope.uneko_audioa.izena).then (function (){
            
            // Cambiamos el audio en la lista
            angular.forEach ($scope.eszenak, function (eszena){
              
              if (eszena.id === $scope.uneko_eszena_id)
                eszena.audioa = '';
                
            });
            
            $scope.uneko_audioa.izena = '';
            $scope.uneko_audioa.iraupena = 0;
            $scope.uneko_audioa.counter = 0;
            
            // Updatemos la base de datos
            Database.query ("UPDATE eszenak SET audioa='' WHERE id=?", [$scope.uneko_eszena_id]).then (function (){}, function (error){
              console.log ("IpuinaCtrl, audioa_delete update", error);
            });
            
          }, function (error) {
            console.log ("IpuinaCtrl, audioa_delete removeFile", error);
          });
          
        }
        
      }, function (error){
        console.log ("IpuinaCtrl, audioa_delete confirm", error);
      });
        
    }
    
  };
  
  $scope.audioa_tab_desaukeratua = function (){
    
    $scope.audioa_kill ();
    
  };
  
  $scope.audioa_kill = function (){
    
    Audio.geratuMakinak ();
    
    // Ponemos el contador a 0
    $scope.uneko_audioa.counter = 0;
    
    // Si está el contador en marcha lo paramos
    if ($scope.kontador !== undefined)
      $timeout.cancel ($scope.kontador);
    
  };
  
  $scope.bideo_modua_play = function (){
    
    $scope.play_eszena (0);
    
  };
  
  $scope.bideo_modua_stop = function (){
    
    if ($scope.bideo_modua.playing){
      
      if ($scope.bideo_modua.interval !== undefined)
        $interval.cancel ($scope.bideo_modua.interval);
        
      // Paramos la posible reproducción del audio
      Audio.geratuMakinak ();
      
      // Desbloqueamos los objetos/textos de la eszena
      $scope.$broadcast ("bideo_modua_off");
      
      $scope.bideo_modua.playing = false;
      
    }
    
  };
  
  $scope.play_eszena = function (ind){
    
    var lapso = 5; // Numero de segundos minimo entre una eszena y la siguiente
    
    if (ind < $scope.eszenak.length){
      $scope.bideo_modua.playing = true;
      
      if ($scope.bideo_modua.interval !== undefined)
        $interval.cancel ($scope.bideo_modua.interval);
        
      Audio.getDuration ($scope.eszenak[ind].audioa).then (function (iraupena){
        
        lapso = Math.max (lapso, iraupena);
        
        $scope.changeEszena ($scope.eszenak[ind], true);
        
        if (iraupena > 0)
          Audio.play ($scope.eszenak[ind].audioa);
        
        $scope.bideo_modua.interval = $interval (function (){ $scope.play_eszena (ind+1); }, lapso * 1000);
        
      }, function (){
        
        $scope.changeEszena ($scope.eszenak[ind], true);
        
        $scope.bideo_modua.interval = $interval (function (){ $scope.play_eszena (ind+1); }, lapso * 1000);
        
      });
      
    }
    else{
      
      // Hemos llegado al final -> desactivamos el interval y nos quedamos en la última eszena
      $scope.bideo_modua_stop ();
      
    }
    
  };
  
  var onError = function (err){
    
    console.log ('err', err);
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
  document.addEventListener ('pause',  function (){
    
    // Paramos la posible reproducción/grabación del audio
    $scope.audioa_kill ();
    
  });
  
  $scope.$on ("$destroy", function (){
    
    // Limpiamos la eszena
    $scope.clearEszena ();
    
    // Paramos la posible reproducción/grabación del audio
    $scope.audioa_kill ();
    
    // Paramos la posible reproducción del cuento
    $scope.bideo_modua_stop ();
    
  });
  
}]);