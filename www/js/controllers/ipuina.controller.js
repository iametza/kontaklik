app.controller('IpuinaCtrl',['$scope', '$compile', '$route', '$q', 'Kamera', 'Audio', 'Files', 'Database', 'Funtzioak', 'Ipuinak', '$cordovaDialogs', '$uibModal', '$cordovaFile', '$timeout', function($scope, $compile, $route, $q, Kamera, Audio, Files, Database, Funtzioak, Ipuinak, $cordovaDialogs, $uibModal, $cordovaFile, $timeout){
  
  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.eszenak_nabigazioa = {'aurrera': false, 'atzera': false};
  $scope.objektuak = [];
  $scope.fondoak = [];
  $scope.uneko_eszena_id = 0;
  $scope.uneko_audioa = {'izena': '', 'iraupena': 0, 'counter': 0, 'egoera': 'stop'};
  $scope.menuaCollapsed = false;
  $scope.bideo_modua = {'playing': false, 'uneko_eszena': 0, 'timer': undefined};
  
  var kontador;
  var img_play_eszena;
  var inBackground = false;
  var destroyed = false;
  var eszena_aldatzen = false;
  var lock_play = false;
  
  $scope.init = function (){
    
    // Paramos la musikilla de fondo
    $scope.soinuak.audio_fondo_stop ();
    
    // Txapuzilla para meter el play de la eszena
    img_play_eszena = angular.element ('<img src="images/ikonoak/play.png" id="play_eszena" ng-click="play_eszena ()" />');
    var el = $compile (img_play_eszena)($scope);
    
    angular.element ('#eszenatokia').append (img_play_eszena);
    $scope.insertHere = el;
    // Txapuzilla ends
    
    // Recogemos los datos del erabiltzaile
    Database.getRows ('erabiltzaileak', {'id': $route.current.params.erabiltzailea_id}, '').then (function (emaitza){
      
      if (emaitza.length === 1){
        $scope.erabiltzailea = emaitza[0];
        
        // Recogemos los datos del ipuina
        Database.getRows ('ipuinak', {'fk_erabiltzailea': $scope.erabiltzailea.id, 'id': $route.current.params.ipuina_id}, '').then (function (emaitza){
          
          if (emaitza.length === 1){
            $scope.ipuina = emaitza[0];
            
            // Recogemos las eszenak del ipuina
            getEszenak ();
            
            // Recogemos los objektuak
            Database.getRows ('irudiak', {'atala': 'objektua', 'ikusgai': 1}, ' ORDER BY timestamp DESC').then (function (irudiak){
              $scope.objektuak = irudiak;
            }, onError);
            
            // Recogemos los fondoak
            Database.getRows ('irudiak', {'atala': 'fondoa', 'ikusgai': 1}, ' ORDER BY timestamp DESC').then (function (irudiak){
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
  
  function getEszenak (){
    
    Database.query ("SELECT e.*, ifnull(i.path, '') path FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [$scope.ipuina.id]).then (function (emaitza){
              
      $scope.eszenak = emaitza;
      
      if ($scope.eszenak.length === 0){
        // Creamos una eszena por defecto
        Database.insertRow ('eszenak', {'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'audioa': '', 'orden': 1}).then (function (emaitza){
          // Limpiamos la eszena por si acaso (si se viene de borrar una eszena, por ejemplo, puede que haga falta)
          clearEszena ();
          
          // Ponemos el fondo en blanco
          angular.element ('#eszenatokia').css ('background-color', '#fff');
          
          // Guardamos la eszena en el array
          $scope.eszenak.push ({'id': emaitza.insertId, 'fk_ipuina': $scope.ipuina.id, 'fk_fondoa': 0, 'path': '', 'audioa': '', 'orden': 1});
          
          $scope.uneko_eszena_id = emaitza.insertId;
          
          $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
          
          $scope.uneko_audioa.izena = '';
          $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
          $scope.uneko_audioa.egoera = 'stop';
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
    
  }
  
  function clearEszena (background){
    background = typeof background !== 'undefined' ? background : true;
    
    if (background){
      // Quitamos el fondo
      angular.element ('#eszenatokia').css ('background-color', 'transparent');
      angular.element ('#eszenatokia').css ('background', 'none');
    }
    
    // Quitamos los objetos/textos
    angular.element ('.objektua, .testua').remove ();
    
  }
  
  $scope.addObjektua = function (objektua){
    
    // Guardamos la relación en la base de datos y creamos el objeto
    Database.insertRow ('eszena_objektuak', {'fk_eszena': $scope.uneko_eszena_id, 'fk_objektua': objektua.id}).then (function (emaitza){
      
      objektuaEszenara (emaitza.insertId);
      
    }, function (error){
      console.log ("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
    
  };
  
  function objektuaEszenara (eszena_objektua_id, show, lock){
    show = typeof show !== 'undefined' ? show : true;
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer ();
    
    Database.query ('SELECT i.path, eo.style FROM eszena_objektuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [eszena_objektua_id]).then (function (objektua){
      
      if (objektua.length === 1){
        
        if (objektua[0].path !== null){
          var elem = angular.element ('<div objektua="objektua" class="objektua" data-objektua-id="' + eszena_objektua_id + '" data-src="' + objektua[0].path + '" data-lock="' + lock + '" ></div>');
          
          elem.hide ();
          
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
          
          if (show)
            elem.fadeIn (500, function (){ d.resolve (); });
          else
            d.resolve ();
        }
        else
          d.resolve ();
        
      }
      else
        d.reject ('IpuinaCtrl objektuaEszenara, objektua.length != 1');
      
    }, function (error){
      console.log ("IpuinaCtrl, objektuaEszenara", error);
      d.reject (error);
    });
    
    return d.promise;
  
  }
  
  $scope.addFondoa = function (fondoa){
    
    // Cambiamos el fondo
    changeFondoa (fondoa);
    
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
      clearEszena ();
      
      // Ponemos el fondo en blanco
      angular.element ('#eszenatokia').css ('background-color', '#fff');
      
      $scope.uneko_eszena_id = emaitza.insertId;
      
      $scope.eszenak_nabigazioa.aurrera = true;
      $scope.eszenak_nabigazioa.atzera = false;
      
      $scope.uneko_audioa.izena = '';
      $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
      $scope.uneko_audioa.egoera = 'stop';
    }, function (error){
      console.log ("IpuinaCtrl, addEszena", error);
    });
    
  };
  
  $scope.pressEszena = function (eszena_id){
    
    if (!eszena_aldatzen){
      
      $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
        
        if (buttonIndex == 1){
          
          Ipuinak.ezabatu_eszena (eszena_id).then (function (){
            
            Ipuinak.eszenak_ordenatu ($route.current.params.ipuina_id).then (function (){
              
              // Recogemos las eszenak que queden del ipuina
              getEszenak ();
              
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
      
    }
    
  };
  
  $scope.pressObjektua = function (objektua){
    
    if (objektua.fk_ipuina !== 0){
      
      $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
        
        if (buttonIndex == 1){
          
          Database.query ('UPDATE irudiak SET ikusgai=0 WHERE id=?', [objektua.id]).then (function (){
            
            // Borramos el objeto de la lista
            var ind = -1;
            angular.forEach ($scope.objektuak, function (o, i){
              
              if (o.id == objektua.id)
                ind = i;
                
            });
            
            if (ind > -1)
              $scope.objektuak.splice (ind, 1);
            
          }, function (error){
            console.log ("IpuinaCtrl, objektua 'ezabatzerakoan'", error);
            d.reject (error);
          });
          
        }
        
      }, function (error){
        console.log ("IpuinaCtrl, pressObjektua confirm", error);
      });
      
    }
    
  };
  
  $scope.pressFondoa = function (fondoa){
    
    if (fondoa.fk_ipuina !== 0){
      
      $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
        
        if (buttonIndex == 1){
          
          Database.query ('UPDATE irudiak SET ikusgai=0 WHERE id=?', [fondoa.id]).then (function (){
            
            // Borramos el fondo de la lista
            var ind = -1;
            angular.forEach ($scope.fondoak, function (f, i){
              
              if (f.id == fondoa.id)
                ind = i;
                
            });
            
            if (ind > -1)
              $scope.fondoak.splice (ind, 1);
            
          }, function (error){
            console.log ("IpuinaCtrl, fondoa 'ezabatzerakoan'", error);
            d.reject (error);
          });
          
        }
        
      }, function (error){
        console.log ("IpuinaCtrl, pressFondoa confirm", error);
      });
      
    }
    
  };
  
  function changeFondoa (fondoa){
    
    angular.element ('#eszenatokia').css ('background', 'url(' + fondoa.path + ')');
    //angular.element ('#eszenatokia').css ('background-size', 'cover');
    angular.element ('#eszenatokia').css ('background-size', '100% 100%');
    
  }
  
  $scope.changeEszena = function (eszena, lock){
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer ();
    var promiseak = [];
    
    if (!eszena_aldatzen){
      
      eszena_aldatzen = true;
      Funtzioak.show_loading ($scope);
      angular.element ('#play_eszena, #play_ipuina, #bideo_modua_stop').hide ();
      
      // Empezamos con el fondo
      Database.getRows ('irudiak', {'atala': 'fondoa', 'id': eszena.fk_fondoa}, '').then (function (emaitza){
        
        // Comprobamos que no se haya salido de la pantalla antes de hacer ná (bien pudiera suceder, la vida es muy perra)
        if (!destroyed){
          
          // Limpiamos la eszena anterior
          clearEszena ();
          
          if (emaitza.length === 1){
            changeFondoa (emaitza[0]);
          }
          else{
            angular.element ('#eszenatokia').css ('background-color', '#fff');
          }
          
          // Cargamos sus objetos
          Database.getRows ('eszena_objektuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (objektuak){
            
            angular.forEach (objektuak, function (objektua){
              promiseak.push (objektuaEszenara (objektua.id, false, lock));
            });
            
            // Cargamos sus textos
            Database.getRows ('eszena_testuak', {'fk_eszena': eszena.id}, ' ORDER BY id ASC').then (function (testuak){
              
              angular.forEach (testuak, function (testua){
                promiseak.push (testuaEszenara (testua.id, false, lock));
              });
              
              // Se espera a que se cumplan todas las promesas de los objetos y textos (prometer hasta...)
              $q.all (promiseak).then (function (){
                
                // Comprobamos que no se haya salido de la pantalla antes de cargar los objetos (bien pudiera suceder, la vida es muy perra)
                if (!destroyed){
                  
                  if (objektuak.length > 0 || testuak.length > 0){
                    
                    var zenbat = angular.element ('.objektua, .testua').length; // x elementos -> x callback
                    //angular.element ('.objektua, .testua').fadeIn (500, function (){
                    angular.element ('.objektua, .testua').show (0, function (){
                      
                      if( --zenbat > 0 ) return; // si no es el último callback nos piramos
                      
                      changeEszena_onError (); // Ya, no es un error. Pero tenemos que hacerlo igual ;)
                      
                      d.resolve ();
                      
                      // Comprobamos que no se haya salido de la pantalla en este medio segundo de fado portugués
                      if (destroyed)
                        clearEszena (false);
                      
                    });
                    
                  }
                  else{
                    changeEszena_onError ();
                    d.resolve ();
                  }
                  
                }
                else{
                  changeEszena_onError ();
                  clearEszena (false);
                  d.reject ('destroyed');
                }
                
              }, function (error){
                changeEszena_onError ();
                d.reject (error);
              });
              
            }, function (error){
              changeEszena_onError ();
              d.reject (error);
            });
            
          }, function (error){
            changeEszena_onError ();
            d.reject (error);
          });
          
        }
        else{
          changeEszena_onError ();
          d.reject ('destroyed');
        }
        
      }, function (error){
        changeEszena_onError ();
        d.reject (error);
      });
      
      // Las siguientes acciones estaban justo antes del 'resolve'. Creo que no está mal ponerlas aqui, puede que el tiempo me contradiga.
      // Básicamente las cambio para que la eszena quede seleccionada en el menú nada más pinchar en ella, que no haya que esperar a que se cargue todo....
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
      $scope.uneko_audioa.egoera = 'stop';
      
    }
    else
      d.reject ('beste eszena aldatzen ari da oraindik');
    
    return d.promise;
    
  };
  
  function changeEszena_onError (){
    
    eszena_aldatzen = false;
    
    Funtzioak.hide_loading ();
    
    if (!$scope.bideo_modua.playing)
      angular.element ('#play_eszena, #play_ipuina').show ();
    else
      angular.element ('#bideo_modua_stop').show ();
    
  }
  
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
    
    modala.rendered.then (function (){
      $scope.soinuak.audio_play ('popup');
    });
    
    modala.result.then (function (testua_id){
      
      testuaEszenara (testua_id);
      
    }, function (error){
      console.log ("IpuinaCtrl, addTestua", error);
    });
                 
  };
  
  function testuaEszenara (testua_id, show, lock){
    show = typeof show !== 'undefined' ? show : true;
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer ();
    
    Database.query ('SELECT testua, style FROM eszena_testuak WHERE id=?', [testua_id]).then (function (testua){
      
      if (testua.length === 1){
        var elem = angular.element ('<div testua="testua" class="testua" data-testua-id="' + testua_id + '" data-lock="' + lock + '"></div>');
        
        elem.hide ();
        
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
        
        if (show)
          elem.fadeIn (500, function (){ d.resolve (); });
        else
          d.resolve ();
      }
      else
        d.reject ('ezin jaso testua');
      
    }, function (error){
      console.log ("IpuinaCtrl, testuaEszenara SELECT", error);
      d.reject (error);
    });
    
    return d.promise;
    
  }
  
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
    
    angular.element ('.goiko-menua, #play_eszena').fadeToggle (1000);
    
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
      
      Database.insertRow ('irudiak', {'path': irudia, 'atala': atala, 'fk_ipuina': $scope.ipuina.id, 'ikusgai': 1}).then (function (emaitza){
        
        switch (atala){
          case 'objektua': $scope.objektuak.unshift ({'id': emaitza.insertId, 'path': irudia, 'fk_ipuina': $scope.ipuina.id}); break;
          case 'fondoa': $scope.fondoak.unshift ({'id': emaitza.insertId, 'path': irudia, 'fk_ipuina': $scope.ipuina.id}); break;
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
        
        Database.insertRow ('irudiak', {'path': irudia, 'atala': atala, 'fk_ipuina': $scope.ipuina.id, 'ikusgai': 1}).then (function (emaitza){
          
          switch (atala){
            case 'objektua': $scope.objektuak.unshift ({'id': emaitza.insertId, 'path': irudia, 'fk_ipuina': $scope.ipuina.id}); break;
            case 'fondoa': $scope.fondoak.unshift ({'id': emaitza.insertId, 'path': irudia, 'fk_ipuina': $scope.ipuina.id}); break;
          }
          
        }, onError);
        
      }, onError);
      
    }, onError);
    
  };
  
  $scope.audioa_startRecord = function (){
    
    if (Audio.egoera () == 'stop'){
      
      // Antes de grabar comprobamos que se tiene permiso, de lo contrario no funciona la grabación. A partir de Android 6, como sabrá usted, no se piden
      // los permisos necesarios de la alpicación cuando se instala sino en tiempo de ejecución, cuando se necesitan. Pues pasa lo siguiente, cuando vamos
      // a grabar, al crear el objeto "media", se nos pide el permiso necesario, aceptamos y cuando volvemos a intentar grabar el objeto "media" se crea
      // corrupto, erróneo. Era necesario salir de la aplicación y volver a entrar para poder grabar. Por lo tanto necesito saber que se tiene permiso antes de
      // ponerme a grabar. Y no sólo eso, una vez "resuelto" esto, es decir, aun usando un plugin para comprobar/pedir permiso para grabar podia darse el caso
      // de que siguiera sin funcionar porque, vete tú a saber porqué, si todavia no teniamos permiso para acceder al contenido multimedia seguidamente
      // se pedia este permiso, lo que volvia a crea el objeto "media" corrupto... Solución, una función que comprueba que se tienen todos los permisos
      // necesarios. Es lo que hay.
      
      Funtzioak.baimenak_txek ().then (function (baimenak){
        
        if (baimenak == 'ok'){
          
          $scope.uneko_audioa.egoera = 'record';
          
          kontador = $timeout (time_counter, 1000);
          
          Audio.startRecord ('audioa_' + $scope.uneko_eszena_id).then (function (audioa){
            
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
                
              }, function (error){
                console.log ("IpuinaCtrl, startRecord update", error);
              });
              
            }, function (error){
              console.log ("IpuinaCtrl, startRecord movefile", error);
            });
            
          }, function (error){
            time_counter_reset ();
            $scope.uneko_audioa.egoera = 'stop';
            console.log ("IpuinaCtrl, startRecord", error);
          });
          
        }
        
      }, function (error){
        d.reject (error);
        console.log ("IpuinaCtrl, startRecord baimenak_txek", error);
      });
      
    }
    
  };
  
  function time_counter (){
    
    $scope.uneko_audioa.counter++;
    kontador = $timeout (time_counter, 1000);
    
  }
  
  function time_counter_reset (){
    
    $scope.uneko_audioa.counter = 0;
    
    if (kontador !== undefined)
      $timeout.cancel (kontador);
      
  }
  
  $scope.audioa_stopRecord = function (){
    
    Audio.stopRecord ();
    
    $scope.uneko_audioa.egoera = 'stop';
    
    time_counter_reset ();
    
  };
  
  $scope.audioa_play = function (){
    
    if ($scope.uneko_audioa.izena !== ''){
      
      if (Audio.egoera () == 'stop' || Audio.egoera () == 'pause'){
        
        $scope.uneko_audioa.egoera = 'play';
        
        kontador = $timeout (time_counter, 1000);
        
        Audio.play ($scope.uneko_audioa.izena).then (function (){
          
          time_counter_reset ();
          
          $scope.uneko_audioa.egoera = 'stop';
          
        }, function (error){
          
          if (error == 'resume'){ // no hay error, ya se estaba reproduciendo el mismo audio
            
            // Recogemos el momento donde estaba la reproducción y lo "sincronizamos" con nuestro contador
            Audio.getCurrentPosition ().then (function (posizioa){
              
              $scope.uneko_audioa.counter = Math.max ($scope.uneko_audioa.counter, Math.floor (posizioa));
              
            }, function (error){
              console.log ("IpuinaCtrl, audioa_play getCurrentPosition", error);
            });
            
          }
          else{ // aqui si que hay error....
            time_counter_reset ();
            $scope.uneko_audioa.egoera = 'stop';
          }
            
        });
        
      }
      
    }
    
  };
  
  $scope.audioa_pause = function (){
    
    if (Audio.egoera () == 'play'){
      
      Audio.pause ();
      
      $scope.uneko_audioa.egoera = 'pause';
      
      if (kontador !== undefined)
        $timeout.cancel (kontador);
      
    }
    
  };
  
  $scope.audioa_stop = function (){
    
    Audio.stop ();
    
    $scope.uneko_audioa.egoera = 'stop';
    
    time_counter_reset ();
    
  };
  
  $scope.audioa_delete = function (){
    
    if ($scope.uneko_audioa.izena !== ''){
      
      // Puede que se esté reproduciendo en éste momento...
      audioa_kill ();
      
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
            $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
            $scope.uneko_audioa.egoera = 'stop';
            
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
    
    audioa_kill ();
    
  };
  
  function audioa_kill (){
    
    Audio.geratuMakinak ();
    
    time_counter_reset ();
    
    $scope.uneko_audioa.egoera = 'stop';
    
  }
  
  $scope.bideo_modua_play = function (){
    
    if (!lock_play){
      
      lock_play = true;
      
      $scope.bideo_modua.uneko_eszena = 0;
      
      var zenbat = angular.element ('.goiko-menua, #play_eszena').length; // x elementos -> x callback
      angular.element ('.goiko-menua, #play_eszena').fadeOut (1000, function (){
        
        if( --zenbat > 0 ) return; // si no es el último callback nos piramos
        
        play_ipuina ();
        
      });
      
    }
    
  };
  
  $scope.play_eszena = function (){
    
    if (!lock_play){
      
      lock_play = true;
      
      audioa_kill (); // Paramos la posible reproducción/grabación del audio
      
      // Recogemos el indice de la eszena actual en la lista y la reproducimos
      angular.forEach ($scope.eszenak, function (eszena, ind){
        
        if (eszena.id === $scope.uneko_eszena_id){
          
          $scope.bideo_modua.uneko_eszena = ind;
          
          var zenbat = angular.element ('.goiko-menua, #play_eszena').length; // x elementos -> x callback
          angular.element ('.goiko-menua, #play_eszena').fadeOut (1000, function (){
            
            if( --zenbat > 0 ) return; // si no es el último callback nos piramos
            
            play_ipuina (false);
            
          });
          
        }
        
      });
    
    }
    
  };
  
  $scope.bideo_modua_stop = function (){
    
    if ($scope.bideo_modua.playing){
      
      if ($scope.bideo_modua.timer !== undefined)
        $scope.bideo_modua.timer.stop ();
        
      // Paramos la posible reproducción del audio
      Audio.geratuMakinak ();
      
      // Desbloqueamos los objetos/textos de la eszena
      $scope.$broadcast ("bideo_modua_off");
      
      $scope.bideo_modua.playing = false;
      lock_play = false;
      
      angular.element ('.goiko-menua, #play_eszena').fadeIn (1000, function (){});
      
    }
    
  };
  
  function play_ipuina (osorik){
    osorik = typeof osorik !== 'undefined' ? osorik : true;
    
    var lapso = 5; // Numero de segundos minimo entre una eszena y la siguiente
    
    if ($scope.bideo_modua.uneko_eszena < $scope.eszenak.length){
      $scope.bideo_modua.playing = true;
      
      if ($scope.bideo_modua.timer !== undefined)
        $scope.bideo_modua.timer.stop ();
        
      Audio.getDuration ($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa).then (function (iraupena){
        
        lapso = Math.max (lapso, iraupena);
        
        $scope.changeEszena ($scope.eszenak[$scope.bideo_modua.uneko_eszena], true).then (function (){
          
          // Ojete: puede que en lo que se tarda en cargar la eszena se haya parado la reproducción....
          if ($scope.bideo_modua.playing){
            
            if (iraupena > 0)
              Audio.play ($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa);
            
            $scope.bideo_modua.timer = new Funtzioak.Timer (function (){
              
              if (osorik){
                $scope.bideo_modua.uneko_eszena++;
                play_ipuina ();
              }
              else
                $scope.bideo_modua_stop ();
              
            }, lapso * 1000);
            
            if (inBackground)
              pause_ipuina ();
            
          }
          
        }, function (error){
          console.log ("IpuinaCtrl, play_ipuina changeEszena audiokin", error);
          $scope.bideo_modua_stop ();
        });
        
      }, function (){
        
        $scope.changeEszena ($scope.eszenak[$scope.bideo_modua.uneko_eszena], true).then (function (){
          
          // Ojete: puede que en lo que se tarda en cargar la eszena se haya parado la reproducción....
          if ($scope.bideo_modua.playing){
            
            $scope.bideo_modua.timer = new Funtzioak.Timer (function (){
              
              if (osorik){
                $scope.bideo_modua.uneko_eszena++;
                play_ipuina ();
              }
              else
                $scope.bideo_modua_stop ();
              
            }, lapso * 1000);
            
            if (inBackground)
              pause_ipuina ();
            
          }
          
        }, function (error){
          console.log ("IpuinaCtrl, play_ipuina changeEszena audio gabe", error);
          $scope.bideo_modua_stop ();
        });
        
      });
      
    }
    else{
      
      // Hemos llegado al final -> desactivamos el timer y nos quedamos en la última eszena
      $scope.bideo_modua_stop ();
      
    }
    
  }
  
  function pause_ipuina (){
    
    if ($scope.bideo_modua.timer !== undefined)
      $scope.bideo_modua.timer.pause ();
      
    if (Audio.egoera () == 'play')
      Audio.pause ();
      
  }
  
  function resume_ipuina (){
    
    if ($scope.bideo_modua.timer !== undefined)
      $scope.bideo_modua.timer.resume ();
      
    if (Audio.egoera () == 'pause')
      Audio.play ($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa);
      
  }
  
  var onError = function (err){
    
    console.log ('err', err);
    
  };
  
  document.addEventListener ('deviceready', function (){
    
    $scope.init ();
    
  });
  
  document.addEventListener ('pause',  function (){
    
    inBackground = true;
    
    if ($scope.bideo_modua.playing){
      
      pause_ipuina ();
        
    }
    else
      audioa_kill (); // Paramos la posible reproducción/grabación del audio
    
  });
  
  document.addEventListener ('resume',  function (){
    
    inBackground = false;
    
    if ($scope.bideo_modua.playing){
      
      resume_ipuina ();
        
    }
    
  });
  
  $scope.$on ("$destroy", function (){
    
    // Limpiamos la eszena
    clearEszena ();
    
    // Paramos la posible reproducción/grabación del audio
    audioa_kill ();
    
    // Paramos la posible reproducción del cuento
    $scope.bideo_modua_stop ();
    
    // Quitamos el "botón" de reproducción de la eszena
    img_play_eszena.remove ();
    
    destroyed = true;
    
  });
  
}]);