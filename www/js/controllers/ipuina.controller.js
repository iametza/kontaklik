app.controller('IpuinaCtrl', ['$scope', '$compile', '$route', '$q', '$cordovaDialogs', '$uibModal', '$cordovaFile', '$timeout', '$window', '$http', '$location', '$cordovaVibration', 'Kamera', 'Audio', 'Files', 'Database', 'Funtzioak', 'Ipuinak', 'Baimenak', 'WizardHandler', 'Upload', function($scope, $compile, $route, $q, $cordovaDialogs, $uibModal, $cordovaFile, $timeout, $window, $http, $location, $cordovaVibration, Kamera, Audio, Files, Database, Funtzioak, Ipuinak, Baimenak, WizardHandler, Upload) {

  $scope.erabiltzailea = {};
  $scope.ipuina = {};
  $scope.eszenak = [];
  $scope.eszenak_nabigazioa = {
    'aurrera': false,
    'atzera': false
  };
  $scope.objektuak = [];
  $scope.fondoak = [];
  $scope.audio_izena = '';
  $scope.uneko_eszena_id = 0;
  $scope.uneko_audioa = {
    'izena': '',
    'iraupena': 0,
    'counter': 0,
    'egoera': 'stop'
  };
  $scope.menuaCollapsed = false;
  $scope.bideo_modua = {
    'playing': false,
    'uneko_eszena': 0,
    'timer': undefined
  };
  $scope.ahotsak = [{
      audioa: "assets/audioak/arranopola.mp3",
      izena: 'Arranopola!'
    },
    {
      audioa: "assets/audioak/bazen-behin-euskal-herrian.mp3",
      izena: 'Bazen behin'
    },
    {
      audioa: "assets/audioak/bazen-behin2.mp3",
      izena: 'Bazen behin...'
    },
    {
      audioa: "assets/audioak/beldurra.mp3",
      izena: 'Beldurra!'
    },
    {
      audioa: "assets/audioak/hau-da-komeria.mp3",
      izena: 'Hau komeria!'
    },
    {
      audioa: "assets/audioak/hau-poza.mp3",
      izena: 'Hau poza! (1)'
    },
    {
      audioa: "assets/audioak/hau-poza2.mp3",
      izena: 'Hau poza! (2)'
    },
    {
      audioa: "assets/audioak/hau-poza3.mp3",
      izena: 'Hau poza! (3)'
    }
  ];
  var portadaTimeout, kontrazalaTimeout;
  var kontador;
  //var img_play_eszena;
  var inBackground = false;
  var destroyed = false;
  var eszena_aldatzen = false;
  var lock_play = false;
  var tutoriala_ikusita = []; // IDs de usuarios que han visto el tutorial
  var collapse = {
    'goikoa': false,
    'behekoa': false
  };
  var init = function() {
    angular.element('.stop_erakutsi').hide();
    angular.element('.atzera_erakutsi').hide();
    // Cargando....
    angular.element('#lanean').show();

    // Paramos la musikilla de fondo
    $scope.soinuak.audio_fondo_stop();

    //angular.element('#elkarbanatu').show('slow');

    // Recogemos los usuarios que han visto el tutorial
    if ('tutoriala_ikusita' in $window.localStorage)
      tutoriala_ikusita = JSON.parse($window.localStorage.tutoriala_ikusita);

    // Recogemos los datos del erabiltzaile
    Database.getRows('erabiltzaileak', {
      'id': $route.current.params.erabiltzailea_id
    }, '').then(function(emaitza) {

      if (emaitza.length === 1) {
        $scope.erabiltzailea = emaitza[0];
        //console.log('$scope.erabiltzailea', $scope.erabiltzailea);
        // Recogemos los datos del ipuina
        Database.getRows('ipuinak', {
          'fk_erabiltzailea': $scope.erabiltzailea.id,
          'id': $route.current.params.ipuina_id
        }, '').then(function(emaitza) {

          if (emaitza.length === 1) {
            $scope.ipuina = emaitza[0];

            // Recogemos las eszenak del ipuina
            getEszenak();

            // Recogemos los objektuak
            Database.getRows('irudiak', {
              'atala': 'objektua',
              'ikusgai': 1
            }, ' ORDER BY timestamp DESC').then(function(objektuak) {

              // Establecemos el path completo y 'real'
              angular.forEach(objektuak, function(objektua, ind) {
                objektuak[ind].fullPath = Funtzioak.get_fullPath(objektua);
                objektuak[ind].miniPath = objektuak[ind].fullPath.replace(objektua.izena, 'miniaturak/' + objektua.izena);
              });

              $scope.objektuak = objektuak;

            }, onError);

            // Recogemos los fondoak
            Database.getRows('irudiak', {
              'atala': 'fondoa',
              'ikusgai': 1
            }, ' ORDER BY timestamp DESC').then(function(fondoak) {

              // Establecemos el path completo y 'real'
              angular.forEach(fondoak, function(fondoa, ind) {
                fondoak[ind].fullPath = Funtzioak.get_fullPath(fondoa);
                fondoak[ind].miniPath = fondoak[ind].fullPath.replace(fondoa.izena, 'miniaturak/' + fondoa.izena);
              });

              $scope.fondoak = fondoak;

            }, onError);

            // Recogemos los bokadiloak
            Database.getRows('irudiak', {
              'atala': 'bokadiloa',
              'ikusgai': 1
            }, ' ORDER BY timestamp DESC').then(function(bokadiloak) {
              // Establecemos el path completo y 'real'
              angular.forEach(bokadiloak, function(bokadiloa, ind) {
                bokadiloak[ind].fullPath = Funtzioak.get_fullPath(bokadiloa);
              });

              $scope.bokadiloak = bokadiloak;

            }, onError);
          } else
            window.location = "#/ipuinak/" + $scope.erabiltzailea.id;

        }, function(error) {
          console.log("IpuinaCtrl, ipuina datuak jasotzen", error);
        });
      } else
        window.location = "#/";

    }, function(error) {
      console.log("IpuinaCtrl, erabiltzaile datuak jasotzen", error);
    });

  };
  /** Elkarbanatu **/
  $scope.elkarbanatu = function() {
    Funtzioak.botoia_animatu(angular.element('#elkarbanatu'), 'images/ikonoak/elkarbanatu.png', 'images/ikonoak/elkarbanatu-press.png');

    var modala = $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'lg',
      templateUrl: 'views/modals/elkarbanatu.html',
      controller: 'ElkarbanatuCtrl'
    });

    modala.rendered.then(function() {
      $scope.soinuak.audio_play('popup');
    });

    modala.result.then(function(result) {
      switch (result.aukera) {
        case 1:
          angular.element('#lanean').show();
          Upload.ipuinaIgo($route.current.params.erabiltzailea_id, $route.current.params.ipuina_id).then(function() {
            angular.element('#elkarbanatu').attr('src', 'images/ikonoak/check.png');
            angular.element('#lanean').hide();
          }, function(err) {
            angular.element('#elkarbanatu').attr('src', 'images/ikonoak/cross.png');
            angular.element('#lanean').hide();
          });
          break;
        case 0:
        default:
          break;
      }
    });

  };
  /** Audioen Funtzioak **/
  $scope.openAudioa = function(audioa) {
    var modala = $uibModal.open({
      animation: true,
      backdrop: 'static',
      templateUrl: 'views/modals/audioak.html',
      controller: 'AudioakCtrl',
      windowClass: 'gardena',
      resolve: {
        audioa: audioa
      }
    });

    modala.rendered.then(function() {
      $scope.soinuak.audio_play('popup');
    });

    modala.result.then(function(result) {
      switch (result.aukera) {
        case 1:
          saveAudioa(result.audioa);
          $scope.audio_izena = result.audioa.izena;
          break;
        case 0:
        default:
          break;
      }
    });
  };
  $scope.playAudioa = function(audioa) {
    Audio.playMp3(audioa.audioa);
  };

  var saveAudioa = function(ahotsa) {
    console.log('saveAudioa applicationDirectory');
    // Guardamos el audio en la base de datos
    Database.query('UPDATE eszenak SET audioa=?, cordova_file=? WHERE id=?', [ahotsa.audioa, 'applicationDirectory', $scope.uneko_eszena_id]).then(function() {

      // Cambiamos el audio en la lista
      angular.forEach($scope.eszenak, function(eszena) {
        if (eszena.id === $scope.uneko_eszena_id)
          eszena.audioa = ahotsa.audioa;
      });

      $scope.uneko_audioa.izena = ahotsa.audioa;
      $scope.uneko_audioa.mota = 'applicationDirectory';
      Audio.getDuration(ahotsa.audioa, 'applicationDirectory').then(function(iraupena) {
        $scope.uneko_audioa.iraupena = iraupena;
      }, function() {
        $scope.uneko_audioa.iraupena = 0;
      });

    }, function(error) {
      console.log("IpuinaCtrl, saveAudioa", error);
    });

  };

  function getEszenak() {
    Database.query("SELECT e.*, ifnull(i.cordova_file, '') cordova_file_fondoa, ifnull(i.path, '') path, ifnull(i.izena, '') izena FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [$scope.ipuina.id]).then(function(emaitza) {
      $scope.eszenak = emaitza;

      if ($scope.eszenak.length === 0) {

        // Creamos una eszena por defecto
        Database.insertRow('eszenak', {
          'fk_ipuina': $scope.ipuina.id,
          'fk_fondoa': 0,
          'audioa': '',
          'orden': 1
        }).then(function(emaitza) {
          // Limpiamos la eszena por si acaso (si se viene de borrar una eszena, por ejemplo, puede que haga falta)
          clearEszena();

          // Ponemos el fondo en blanco
          angular.element('#eszenatokia').css('background', "url('images/fondoa-aukeratu.png') no-repeat center center");

          // Guardamos la eszena en el array
          $scope.eszenak.push({
            'id': emaitza.insertId,
            'fk_ipuina': $scope.ipuina.id,
            'fk_fondoa': 0,
            'fondoa_fullPath': '',
            'audioa': '',
            'orden': 1
          });

          $scope.uneko_eszena_id = emaitza.insertId;

          $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;

          $scope.uneko_audioa.izena = '';
          $scope.uneko_audioa.mota = '';
          $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
          $scope.uneko_audioa.egoera = 'stop';

          angular.element('#play_eszena').show();
          angular.element('#lanean').hide();

        }, function(error) {
          console.log("IpuinaCtrl, getEszenak defektuzko eszena sortzerakoan", error);
        });
      } else {

        // Establecemos el path completo y 'real'
        angular.forEach($scope.eszenak, function(eszena, ind) {
          $scope.eszenak[ind].fondoa_fullPath = Funtzioak.get_fullPath({ cordova_file: eszena.cordova_file_fondoa, path: eszena.path, izena: eszena.izena });
        });

        // Cargamos la primera eszena
        $scope.uneko_eszena_id = $scope.eszenak[0].id;
        $scope.uneko_audioa.izena = $scope.eszenak[0].izena;
        $scope.uneko_audioa.mota = $scope.eszenak[0].cordova_file;
        $scope.audio_izena = $scope.eszenak[0].cordova_file == 'dataDirectory'? 'Zure ahotsa': '';
        $scope.eszenak_nabigazioa.aurrera = false;
        $scope.eszenak_nabigazioa.atzera = ($scope.eszenak.length > 1);

        $scope.changeEszena($scope.eszenak[0]);

      }

    }, function(error) {
      console.log("IpuinaCtrl, getEszenak ipuina datuak jasotzen", error);
    });
  }

  function clearEszena(background) {
    background = typeof background !== 'undefined' ? background : true;
    if (background) {
      // Quitamos el fondo
      angular.element('#eszenatokia').css('background-color', 'transparent');
      angular.element('#eszenatokia').css('background', 'none');
    }
    // Quitamos los objetos/textos
    angular.element('.objektua, .testua').remove();
  };

  $scope.addObjektua = function(objektua) {
    Funtzioak.maxZindex($scope.uneko_eszena_id).then(function(res) {
      var zindex = res + 1;
      // Guardamos la relación en la base de datos y creamos el objeto
      Database.insertRow('eszena_objektuak', {
        'fk_eszena': $scope.uneko_eszena_id,
        'fk_objektua': objektua.id,
        'zindex': zindex
      }).then(function(emaitza) {
        Funtzioak.objektuaEszenara(emaitza.insertId, true, false, $scope);
      }, function(error) {
        console.log("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
      });
    }, function(error) {
      console.log("IpuinaCtrl, getTotalObjects", error);
    });
  };


  $scope.addFondoa = function(fondoa) {

    // Cambiamos el fondo
    changeFondoa(fondoa);

    // Guardamos el fondo en la base de datos
    Database.query('UPDATE eszenak SET fk_fondoa=? WHERE id=?', [fondoa.id, $scope.uneko_eszena_id]).then(function() {

      // Cambiamos el fondo en la lista
      angular.forEach($scope.eszenak, function(eszena) {

        if (eszena.id === $scope.uneko_eszena_id) {
          eszena.fk_fondoa = fondoa.id;
          eszena.fondoa_fullPath = fondoa.fullPath;
        }

      });

    }, function(error) {
      console.log("IpuinaCtrl, fondoa datu basean aldatzen", error);
    });

  };

  $scope.addEszena = function() {

    Database.insertRow('eszenak', {
      'fk_ipuina': $scope.ipuina.id,
      'fk_fondoa': 0,
      'audioa': '',
      'orden': $scope.eszenak.length + 1
    }).then(function(emaitza) {
      // Guardamos la eszena en el array
      $scope.eszenak.push({
        'id': emaitza.insertId,
        'fk_ipuina': $scope.ipuina.id,
        'fk_fondoa': 0,
        'fondoa_fullPath': '',
        'audioa': '',
        'cordova_file':'',
        'orden': $scope.eszenak.length + 1
      });

      // Limpiamos la eszena anterior
      clearEszena();

      // Ponemos el fondo en blanco
      angular.element('#eszenatokia').css('background', "url('images/fondoa-aukeratu.png') no-repeat center center");

      $scope.uneko_eszena_id = emaitza.insertId;

      $scope.eszenak_nabigazioa.aurrera = true;
      $scope.eszenak_nabigazioa.atzera = false;

      $scope.uneko_audioa.izena = '';
      $scope.uneko_audioa.mota = '';
      $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
      $scope.uneko_audioa.egoera = 'stop';
    }, function(error) {
      console.log("IpuinaCtrl, addEszena", error);
    });

  };

  $scope.pressEszena = function(eszena_id) {
    $cordovaVibration.vibrate(100);
    if (!eszena_aldatzen) {
      var modala = $uibModal.open({
        animation: true,
        backdrop: 'static',
        templateUrl: 'views/modals/eszena_menu_aukerak.html',
        controller: 'EszenaMenuAukerakCtrl',
        windowClass: 'gardena',
        resolve: {
          eszena_id: eszena_id
        }
      });

      modala.rendered.then(function() {
        $scope.soinuak.audio_play('popup');
      });

      modala.result.then(function(result) {
        switch (result.aukera) {
          case 1:
            Ipuinak.ezabatu_eszena(result.eszena_id).then(function() {
              Ipuinak.eszenak_ordenatu($scope.ipuina.id).then(function() {
                // Recogemos las eszenak que queden del ipuina
                getEszenak();
              }, function(error) {
                console.log("IpuinaCtrl, pressEszena eszenak_ordenatu", error);
              });
            }, function(error) {
              console.log("IpuinaCtrl, pressEszena ezabatu_eszena", error);
            });
            break;
          case 0:
          default:
            break;
        }
      });
    }
  };

  $scope.pressObjektua = function(objektua) {
    $cordovaVibration.vibrate(100);
    if (objektua.fk_ipuina !== 0) {
      var modala = $uibModal.open({
        animation: true,
        backdrop: 'static',
        templateUrl: 'views/modals/objektu_menu_aukerak.html',
        controller: 'ObjektuMenuAukerakCtrl',
        windowClass: 'gardena',
        resolve: {
          objektua_id: objektua.id
        }
      });

      modala.rendered.then(function() {
        $scope.soinuak.audio_play('popup');
      });

      modala.result.then(function(result) {
        switch (result.aukera) {
          case 1:
            Database.query('UPDATE irudiak SET ikusgai=0 WHERE id=?', [objektua.id]).then(function() {
              // Borramos el objeto de la lista
              var ind = -1;
              angular.forEach($scope.objektuak, function(o, i) {
                if (o.id == objektua.id)
                  ind = i;
              });
              if (ind > -1)
                $scope.objektuak.splice(ind, 1);
            }, function(error) {
              console.log("IpuinaCtrl, objektua 'ezabatzerakoan'", error);
              d.reject(error);
            });
            break;
          case 0:
          default:
            break;
        }
      });
    }
  };

  $scope.pressFondoa = function(fondoa) {
    $cordovaVibration.vibrate(100);
    if (fondoa.fk_ipuina !== 0) {
      var modala = $uibModal.open({
        animation: true,
        backdrop: 'static',
        templateUrl: 'views/modals/fondo_menu_aukerak.html',
        controller: 'FondoMenuAukerakCtrl',
        windowClass: 'gardena',
        resolve: {
          fondo_id: fondoa.id
        }
      });

      modala.rendered.then(function() {
        $scope.soinuak.audio_play('popup');
      });

      modala.result.then(function(result) {
        switch (result.aukera) {
          case 1:
            Database.query('UPDATE irudiak SET ikusgai=0 WHERE id=?', [fondoa.id]).then(function() {
              // Borramos el fondo de la lista
              var ind = -1;
              angular.forEach($scope.fondoak, function(f, i) {
                if (f.id == fondoa.id)
                  ind = i;
              });

              if (ind > -1)
                $scope.fondoak.splice(ind, 1);

            }, function(error) {
              console.log("IpuinaCtrl, fondoa 'ezabatzerakoan'", error);
              d.reject(error);
            });
            break;
          case 0:
          default:
            break;
        }
      });
    }
  };

  function changeFondoa(fondoa) {

    angular.element('#eszenatokia').css('background', 'url(' + fondoa.fullPath + ')');
    //angular.element ('#eszenatokia').css ('background-size', 'cover');
    angular.element('#eszenatokia').css('background-size', '100% 100%');

  }

  $scope.changeEszena = function(eszena, lock) {
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer();
    var promiseak = [];

    if (!eszena_aldatzen) {

      eszena_aldatzen = true;
      //angular.element('#lanean').show();
      angular.element('#play_eszena, #play_ipuina, #bideo_modua_stop').hide();

      // Empezamos con el fondo
      Database.getRows('irudiak', {
        'atala': 'fondoa',
        'id': eszena.fk_fondoa
      }, '').then(function(emaitza) {

        // Comprobamos que no se haya salido de la pantalla antes de hacer ná (bien pudiera suceder, la vida es muy perra)
        if (!destroyed) {

          // Limpiamos la eszena anterior
          clearEszena();

          if (emaitza.length === 1) {
            emaitza[0].fullPath = Funtzioak.get_fullPath(emaitza[0]);
            changeFondoa(emaitza[0]);
          } else {
            angular.element('#eszenatokia').css('background', "url('images/fondoa-aukeratu.png') no-repeat center center");
          }

          // Cargamos sus objetos
          Database.getRows('eszena_objektuak', {
            'fk_eszena': eszena.id
          }, ' ORDER BY id ASC').then(function(objektuak) {

            angular.forEach(objektuak, function(objektua) {
              promiseak.push(Funtzioak.objektuaEszenara(objektua.id, false, lock, $scope));
            });

            // Cargamos sus textos
            Database.getRows('eszena_testuak', {
              'fk_eszena': eszena.id
            }, ' ORDER BY id ASC').then(function(testuak) {
              angular.forEach(testuak, function(testua) {
                promiseak.push(testuaEszenara(testua.id, false, lock));
              });

              // Se espera a que se cumplan todas las promesas de los objetos y textos (prometer hasta...)
              $q.all(promiseak).then(function() {

                // Comprobamos que no se haya salido de la pantalla antes de cargar los objetos (bien pudiera suceder, la vida es muy perra)
                if (!destroyed) {

                  if (objektuak.length > 0 || testuak.length > 0) {

                    var zenbat = angular.element('.objektua, .testua').length; // x elementos -> x callback
                    //angular.element ('.objektua, .testua').fadeIn (500, function (){
                    angular.element('.objektua, .testua').show(0, function() {

                      if (--zenbat > 0) return; // si no es el último callback nos piramos

                      changeEszena_onError(); // Ya, no es un error. Pero tenemos que hacerlo igual ;)

                      d.resolve();

                      // Comprobamos que no se haya salido de la pantalla en este medio segundo de fado portugués
                      if (destroyed)
                        clearEszena(false);

                    });

                  } else {
                    changeEszena_onError();
                    d.resolve();
                  }

                } else {
                  changeEszena_onError();
                  clearEszena(false);
                  d.reject('destroyed');
                }

              }, function(error) {
                changeEszena_onError();
                d.reject(error);
              });

            }, function(error) {
              changeEszena_onError();
              d.reject(error);
            });

          }, function(error) {
            changeEszena_onError();
            d.reject(error);
          });

        } else {
          changeEszena_onError();
          d.reject('destroyed');
        }

      }, function(error) {
        changeEszena_onError();
        d.reject(error);
      });

      // Las siguientes acciones estaban justo antes del 'resolve'. Creo que no está mal ponerlas aqui, puede que el tiempo me contradiga.
      // Básicamente las cambio para que la eszena quede seleccionada en el menú nada más pinchar en ella, que no haya que esperar a que se cargue todo....
      $scope.uneko_eszena_id = eszena.id;

      // Eszenen nabigazioa eguneratu (aurrera eta atzera botoiak aktibo bai/ez)
      for (var ind = 0; ind < $scope.eszenak.length; ind++) {

        if ($scope.eszenak[ind].id == eszena.id)
          break;

      }

      $scope.eszenak_nabigazioa.aurrera = (ind > 0);
      $scope.eszenak_nabigazioa.atzera = (ind < $scope.eszenak.length - 1);

      $scope.uneko_audioa.izena = eszena.audioa;
      $scope.uneko_audioa.mota = eszena.cordova_file;
      console.log('eszena', eszena)
      Audio.getDuration(eszena.audioa, eszena.cordova_file).then(function(iraupena) {
        $scope.uneko_audioa.iraupena = iraupena;
      }, function() {
        $scope.uneko_audioa.iraupena = 0;
      });
      $scope.uneko_audioa.counter = 0;
      $scope.uneko_audioa.egoera = 'stop';

    } else
      d.reject('beste eszena aldatzen ari da oraindik');

    return d.promise;

  };

  function changeEszena_onError() {
    eszena_aldatzen = false;
    angular.element('#xuria').hide();
    angular.element('#lanean').hide();
    angular.element('#play_ipuina').show();
    if (!$scope.bideo_modua.playing)
      angular.element('#play_eszena').show();
    else
      angular.element('#bideo_modua_stop').show();
  }
  $scope.addBokadiloa = function(bokadiloa) {
    // Guardamos la relación en la base de datos y creamos el objeto
    var testua_id;
    Funtzioak.maxZindex($scope.uneko_eszena_id).then(function(res) {
      var zindex = res + 1;
      Database.insertRow('eszena_testuak', {
        'fk_eszena': $scope.uneko_eszena_id,
        'fk_objektua': bokadiloa.id,
        'zindex': zindex
      }).then(function(emaitza) {
        testua_id = emaitza.insertId;
        var modala = $uibModal.open({
          animation: true,
          //backdrop: 'static',
          templateUrl: 'views/modals/eszena_testua.html',
          controller: 'ModalEszenaTestuaCtrl',
          resolve: {
            eszena_id: $scope.uneko_eszena_id,
            testua_id: testua_id,
            first: true
          }
        });

        modala.rendered.then(function() {
          $scope.soinuak.audio_play('popup');

        });

        modala.result.then(function(result) {
          testuaEszenara(testua_id);
        }, function(error) {
          console.log("IpuinaCtrl, addBokadiloa", error);
        });

      }, function(error) {
        console.log("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
      });
    }, function(error) {
      console.log("IpuinaCtrl, defektuzko eszena sortzerakoan", error);
    });
  };
  var testua_eguneratu = function(emaitza) {


    // Cargamos el texto del elemento
    if (emaitza.testua != undefined)
      angular.element('#testua_' + emaitza.testua_id).next('p.bokadilo-testua').html(emaitza.testua.replace('<span class="gorringo">', '').replace('</span>', ''));
  };

  function testuaEszenara(testua_id, show, lock) {
    show = typeof show !== 'undefined' ? show : true;
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer();
    Database.query('SELECT i.cordova_file, i.path, i.izena, eo.style, zindex FROM eszena_testuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [testua_id]).then(function(testua) {
      if (testua.length === 1) {
        var elem = angular.element('<div data-src="' + Funtzioak.get_fullPath(testua[0]) + '" testua="testua" class="testua" data-testua-id="' + testua_id + '" data-lock="' + lock + '"></div>');

        elem.hide();

        if (testua[0].style !== null) {

          var style_object = JSON.parse(testua[0].style);

          // Sacamos la scale y el rotate del objeto para pasársela a la directiva
          //console.log (style_object.transform);
          //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;

          if (style_object.transform.match(patroia_xy)) {
            elem.attr('data-x', style_object.transform.replace(patroia_xy, "$1"));
            elem.attr('data-y', style_object.transform.replace(patroia_xy, "$2"));
          }

          if (style_object.transform.match(patroia_scale))
            elem.attr('data-scale', style_object.transform.replace(patroia_scale, "$1"));

          if (style_object.transform.match(patroia_rotate))
            elem.attr('data-rotate', style_object.transform.replace(patroia_rotate, "$1"));

          //z-index

          // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
          el = $compile(elem)($scope);

          //elem.children ().css (style_object);
          // Optimización (thaks to iOS): Sólo cargamos lo que nos haga falta
          elem.children().css('transform', style_object.transform);


        } else
          el = $compile(elem)($scope);

        elem.children().css('z-index', parseInt(testua[0].zindex));
        angular.element('#eszenatokia').append(elem);
        $scope.insertHere = el;

        if (show)
          elem.fadeIn(500, function() {
            d.resolve();
          });
        else
          d.resolve();
      } else
        d.reject('ezin jaso testua');

    }, function(error) {
      console.log("IpuinaCtrl, testuaEszenara SELECT", error);
      d.reject(error);
    });

    return d.promise;

  }

  $scope.eszenaAurreratu = function() {
    if ($scope.eszenak_nabigazioa.aurrera) {
      // bloqueamos la navegación para que no se cuelen otras peticiones
      $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
      for (var ind = 0; ind < $scope.eszenak.length; ind++) {
        if ($scope.eszenak[ind].id == $scope.uneko_eszena_id)
          break;
      }

      if (ind > 0) {
        // Cambiamos el orden del elemento en la base de datos
        Database.query('UPDATE eszenak SET orden=orden-1 WHERE id=?', [$scope.eszenak[ind].id]).then(function() {
          // Cambiamos el orden del elemento anterior en la base de datos
          Database.query('UPDATE eszenak SET orden=orden+1 WHERE id=?', [$scope.eszenak[ind - 1].id]).then(function() {
            // Cambiamos el orden de los elementos en la lista y la reordenamos
            $scope.eszenak[ind].orden--;
            $scope.eszenak[ind - 1].orden++;

            var temp = $scope.eszenak[ind];
            $scope.eszenak[ind] = $scope.eszenak[ind - 1];
            $scope.eszenak[ind - 1] = temp;

            $scope.eszenak_nabigazioa.aurrera = (ind - 1 > 0);
            $scope.eszenak_nabigazioa.atzera = true;
          }, function(error) {
            console.log("IpuinaCtrl, eszenaAurreratu second update", error);
          });
        }, function(error) {
          console.log("IpuinaCtrl, eszenaAurreratu first update", error);
        });
      }
    }
  };

  $scope.eszenaAtzeratu = function() {
    if ($scope.eszenak_nabigazioa.atzera) {
      // bloqueamos la navegación para que no se cuelen otras peticiones
      $scope.eszenak_nabigazioa.aurrera = $scope.eszenak_nabigazioa.atzera = false;
      for (var ind = 0; ind < $scope.eszenak.length; ind++) {
        if ($scope.eszenak[ind].id == $scope.uneko_eszena_id)
          break;

      }

      if (ind < ($scope.eszenak.length - 1)) {

        // Cambiamos el orden del elemento en la base de datos
        Database.query('UPDATE eszenak SET orden=orden+1 WHERE id=?', [$scope.eszenak[ind].id]).then(function() {

          // Cambiamos el orden del elemento siguiente en la base de datos
          Database.query('UPDATE eszenak SET orden=orden-1 WHERE id=?', [$scope.eszenak[ind + 1].id]).then(function() {

            // Cambiamos el orden de los elementos en la lista y la reordenamos
            $scope.eszenak[ind].orden++;
            $scope.eszenak[ind + 1].orden--;

            var temp = $scope.eszenak[ind];
            $scope.eszenak[ind] = $scope.eszenak[ind + 1];
            $scope.eszenak[ind + 1] = temp;

            $scope.eszenak_nabigazioa.aurrera = true;
            $scope.eszenak_nabigazioa.atzera = (ind + 1 < $scope.eszenak.length - 1);

          }, function(error) {
            console.log("IpuinaCtrl, eszenaAtzeratu second update", error);
          });

        }, function(error) {
          console.log("IpuinaCtrl, eszenaAtzeratu first update", error);
        });

      }

    }

  };
  /*
   *
   * Goiko eta beheko menuak gorde eta erakutsi
   *
   */
  $scope.goikoMenuaCollapse = function() {
    $scope.soinuak.audio_play('click');
    addAnimationClass(angular.element('#goiko-collapse'), 'botoia-haunditu').then(function(result) {
      result.element.removeClass(result.className);
      var src = collapse.goikoa ? 'images/izkutatu-eszenak.png' : 'images/erakutsi-eszenak.png';
      angular.element('#goiko-collapse img').attr("src", src);
    });
    // Irudia aldatu

    if (!collapse.goikoa) {
      angular.element('#goiko-menua').removeClass('goiko-menua-erakutsi');
      addAnimationClass(angular.element('#goiko-menua'), 'goiko-menua-gorde').then(function(result) {
        collapse.goikoa = !collapse.goikoa;
      });
    } else {
      angular.element('#goiko-menua').removeClass('goiko-menua-gorde');
      addAnimationClass(angular.element('#goiko-menua'), 'goiko-menua-erakutsi').then(function(result) {
        collapse.goikoa = !collapse.goikoa;
      });
    }
  };

  $scope.behekoMenuaCollapse = function() {
    $scope.soinuak.audio_play('click');
    addAnimationClass(angular.element('#beheko-collapse'), 'botoia-haunditu').then(function(result) {
      result.element.removeClass(result.className);
      // Irudia aldatu
      var src = collapse.behekoa ? 'images/izkutatu-menua.png' : 'images/erakutsi-menua.png';
      angular.element('#beheko-collapse img').attr("src", src);
    });

    if (!collapse.behekoa) {
      angular.element('#beheko-menua').removeClass('beheko-menua-erakutsi');
      addAnimationClass(angular.element('#beheko-menua'), 'beheko-menua-gorde').then(function(result) {
        collapse.behekoa = !collapse.behekoa;
      });
    } else {
      angular.element('#beheko-menua').removeClass('beheko-menua-gorde');
      addAnimationClass(angular.element('#beheko-menua'), 'beheko-menua-erakutsi').then(function(result) {
        collapse.behekoa = !collapse.behekoa;
      });
    }
  };
  var addAnimationClass = function(element, className) {
    var d = $q.defer();
    element.addClass(className);
    element.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
      d.resolve({
        element: element,
        className: className
      });
    });
    return d.promise;
  }
  $scope.takeGallery = function(atala) {
    Funtzioak.botoia_animatu(angular.element('.galeria'), 'images/ikonoak/galeria.png', 'images/ikonoak/galeria-press.png');
    $scope.soinuak.audio_play('click');
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: Camera.EncodingType.JPEG,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    Kamera.getPicture(options).then(function(irudia) {
      Kamera.generateThumbnail(irudia).then(function(data) {
        Files.saveBase64ImageThumbnail(irudia, data);
        Files.saveFile(irudia).then(function(irudia) {
          Database.insertRow('irudiak', {
            'cordova_file': 'dataDirectory',
            'path': '',
            'izena': irudia,
            'atala': atala,
            'fk_ipuina': $scope.ipuina.id,
            'ikusgai': 1
          }).then(function(emaitza) {

            /*var elem = {
              'id': emaitza.insertId,
              'fullPath': cordova.file.dataDirectory + irudia,
              'miniPath': cordova.file.dataDirectory + 'miniaturak/' + irudia,
              'fk_ipuina': $scope.ipuina.id
            };
            switch (atala) {
              case 'objektua':
                $scope.objektuak.unshift(elem);
                $scope.addObjektua(elem);
                break;

              case 'fondoa':
                $scope.fondoak.unshift(elem);
                $scope.addFondoa(elem);
                break;
            }*/
            window.location = '#/editorea/' + emaitza.insertId;
          }, onError);
        }, onError);
      }, onError);
    }, onError);
  };

  $scope.takePicture = function(atala) {
    Funtzioak.botoia_animatu(angular.element('.kamara'), 'images/ikonoak/kamara.png', 'images/ikonoak/kamara-press.png');
    $scope.soinuak.audio_play('click');
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      cameraDirection: 0,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };

    Kamera.getPicture(options).then(function(irudia) {
      Kamera.generateThumbnail(irudia).then(function(data) {
        Files.saveBase64ImageThumbnail(irudia, data);
        Files.saveFile(irudia).then(function(irudia) {

          Database.insertRow('irudiak', {
            'cordova_file': 'dataDirectory',
            'path': '',
            'izena': irudia,
            'atala': atala,
            'fk_ipuina': $scope.ipuina.id,
            'ikusgai': 1
          }).then(function(emaitza) {
            window.location = '#/editorea/' + emaitza.insertId;
          }, onError);
        }, onError);
      }, onError);


    }, onError);

  };

  $scope.audioa_startRecord = function() {
    console.log('audioa_startRecord dataDirectory');
    if (Audio.egoera() == 'stop') {

      // Antes de grabar comprobamos que se tiene permiso, de lo contrario no funciona la grabación. A partir de Android 6, como sabrá usted, no se piden
      // los permisos necesarios de la alpicación cuando se instala sino en tiempo de ejecución, cuando se necesitan. Pues pasa lo siguiente, cuando vamos
      // a grabar, al crear el objeto "media", se nos pide el permiso necesario, aceptamos y cuando volvemos a intentar grabar el objeto "media" se crea
      // corrupto, erróneo. Era necesario salir de la aplicación y volver a entrar para poder grabar. Por lo tanto necesito saber que se tiene permiso antes de
      // ponerme a grabar. Y no sólo eso, una vez "resuelto" esto, es decir, aun usando un plugin para comprobar/pedir permiso para grabar podia darse el caso
      // de que siguiera sin funcionar porque, vete tú a saber porqué, si todavia no teniamos permiso para acceder al contenido multimedia seguidamente
      // se pedia este permiso, lo que volvia a crea el objeto "media" corrupto... Solución, una función que comprueba que se tienen todos los permisos
      // necesarios. Es lo que hay.

      Baimenak.konprobatu().then(function(baimenak) {
        if (baimenak == 'ok') {
          $scope.uneko_audioa.egoera = 'record';
          kontador = $timeout(time_counter, 1000);
          Audio.startRecord('audioa_' + $scope.uneko_eszena_id).then(function(audioa) {
            // Mover desde la carpeta temporal a una persistente
            //$cordovaFile.moveFile(audioa.path, audioa.izena, cordova.file.dataDirectory, audioa.izena).then(function() {

            // Guardamos el audio en la base de datos
            Database.query('UPDATE eszenak SET audioa=?, cordova_file=? WHERE id=?', [audioa.izena, 'dataDirectory', $scope.uneko_eszena_id]).then(function() {

              // Cambiamos el audio en la lista
              angular.forEach($scope.eszenak, function(eszena) {

                if (eszena.id === $scope.uneko_eszena_id) {
                  eszena.audioa = audioa.izena;
                  eszena.cordova_file = 'dataDirectory';
                }
              });

              $scope.uneko_audioa.izena = audioa.izena;
              $scope.uneko_audioa.mota = 'dataDirectory';
              $scope.audio_izena = 'Zure ahotsa';
              Audio.getDuration(audioa.izena, 'dataDirectory').then(function(iraupena) {
                $scope.uneko_audioa.iraupena = iraupena;
              }, function() {
                $scope.uneko_audioa.iraupena = 0;
              });

            }, function(error) {
              console.log("IpuinaCtrl, startRecord update", error);
            });

            /*}, function(error) {
              console.log("IpuinaCtrl, startRecord movefile", error);
            });*/

          }, function(error) {
            time_counter_reset();
            $scope.uneko_audioa.egoera = 'stop';
            console.log("IpuinaCtrl, startRecord", error);
          });

        }

      }, function(error) {
        console.log("IpuinaCtrl, startRecord Baimenak.konprobatu", error);
      });

    }

  };

  function time_counter() {

    $scope.uneko_audioa.counter++;
    kontador = $timeout(time_counter, 1000);

  }

  function time_counter_reset() {

    $scope.uneko_audioa.counter = 0;

    if (kontador !== undefined)
      $timeout.cancel(kontador);

  }

  $scope.audioa_stopRecord = function() {

    Audio.stopRecord();

    $scope.uneko_audioa.egoera = 'stop';

    time_counter_reset();

  };

  $scope.audioa_play = function() {

    if ($scope.uneko_audioa.izena !== '') {

      if (Audio.egoera() == 'stop' || Audio.egoera() == 'pause') {

        $scope.uneko_audioa.egoera = 'play';

        kontador = $timeout(time_counter, 1000);

        Audio.play($scope.uneko_audioa.izena, $scope.uneko_audioa.mota).then(function() {

          time_counter_reset();

          $scope.uneko_audioa.egoera = 'stop';

        }, function(error) {

          if (error == 'resume') { // no hay error, ya se estaba reproduciendo el mismo audio

            // Recogemos el momento donde estaba la reproducción y lo "sincronizamos" con nuestro contador
            Audio.getCurrentPosition().then(function(posizioa) {

              $scope.uneko_audioa.counter = Math.max($scope.uneko_audioa.counter, Math.floor(posizioa));

            }, function(error) {
              console.log("IpuinaCtrl, audioa_play getCurrentPosition", error);
            });

          } else { // aqui si que hay error....
            time_counter_reset();
            $scope.uneko_audioa.egoera = 'stop';
          }

        });

      }

    }

  };

  $scope.audioa_pause = function() {

    if (Audio.egoera() == 'play') {

      Audio.pause();

      $scope.uneko_audioa.egoera = 'pause';

      if (kontador !== undefined)
        $timeout.cancel(kontador);

    }

  };

  $scope.audioa_stop = function() {

    Audio.stop();

    $scope.uneko_audioa.egoera = 'stop';

    time_counter_reset();

  };

  $scope.audioa_delete = function() {
    if ($scope.uneko_audioa.izena !== '') {
      // Puede que se esté reproduciendo en éste momento...
      audioa_kill();
      $cordovaDialogs.confirm('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then(function(buttonIndex) {
        if (buttonIndex == 1) {
          console.log('audioa_delete', $scope.uneko_audioa.mota);
          if ($scope.uneko_audioa.mota == 'dataDirectory') {
            // Borramos el fichero
            $cordovaFile.removeFile(cordova.file.dataDirectory + 'audioak', $scope.uneko_audioa.izena).then(function() {

              // Cambiamos el audio en la lista
              angular.forEach($scope.eszenak, function(eszena) {

                if (eszena.id === $scope.uneko_eszena_id)
                  eszena.audioa = '';

              });

              $scope.uneko_audioa.izena = '';
              $scope.uneko_audioa.mota = '';
              $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
              $scope.uneko_audioa.egoera = 'stop';

              // Updatemos la base de datos
              Database.query("UPDATE eszenak SET audioa='', cordova_file = '' WHERE id=?", [$scope.uneko_eszena_id]).then(function() {}, function(error) {
                console.log("IpuinaCtrl, audioa_delete update", error);
              });

            }, function(error) {
              console.log("IpuinaCtrl, audioa_delete removeFile", error);
            });
          } else {
            // Cambiamos el audio en la lista
            angular.forEach($scope.eszenak, function(eszena) {

              if (eszena.id === $scope.uneko_eszena_id)
                eszena.audioa = '';

            });

            $scope.uneko_audioa.izena = '';
            $scope.uneko_audioa.mota = '';
            $scope.uneko_audioa.iraupena = $scope.uneko_audioa.counter = 0;
            $scope.uneko_audioa.egoera = 'stop';

            // Updatemos la base de datos
            Database.query("UPDATE eszenak SET audioa='', cordova_file = '' WHERE id=?", [$scope.uneko_eszena_id]).then(function() {}, function(error) {
              console.log("IpuinaCtrl, audioa_delete update", error);
            });
          }

        }

      }, function(error) {
        console.log("IpuinaCtrl, audioa_delete confirm", error);
      });

    }

  };

  $scope.audioa_tab_desaukeratua = function() {

    audioa_kill();

  };

  function audioa_kill() {
    Audio.geratuMakinak();
    time_counter_reset();
    $scope.uneko_audioa.egoera = 'stop';
  }

  $scope.bideo_modua_play = function() {
    // Ikonoa aldatu
    Funtzioak.botoia_animatu(angular.element('#play_ipuina'), 'images/ikonoak/play.png', 'images/ikonoak/play-press.png');
    if (!lock_play) {
      lock_play = true;
      $scope.bideo_modua.uneko_eszena = 0;

      // Paramos la posible reproducción del audio
      Audio.geratuMakinak();
      Audio.stopMp3();

      var zenbat = angular.element('.play_gorde').length; // x elementos -> x callback
      angular.element('.play_gorde').fadeOut(500, function() {

        if (--zenbat > 0) return; // si no es el último callback nos piramos
        angular.element('.stop_erakutsi').fadeIn(1000, function() {});

        portada().then(function() {
          angular.element('#portada_izenburua').hide();
          if (lock_play) {
            play_ipuina();
          } else {
            $scope.changeEszena($scope.eszenak[0]);
          }
        }, function(err) {
          angular.element('#portada_izenburua').hide();
          $scope.changeEszena($scope.eszenak[0]);
          console.log('changeEszena ' + err);
        });
      });
    }
  };

  $scope.play_eszena = function() {

    if (!lock_play) {

      lock_play = true;

      audioa_kill(); // Paramos la posible reproducción/grabación del audio

      // Recogemos el indice de la eszena actual en la lista y la reproducimos
      angular.forEach($scope.eszenak, function(eszena, ind) {

        if (eszena.id === $scope.uneko_eszena_id) {

          $scope.bideo_modua.uneko_eszena = ind;

          var zenbat = angular.element('.goiko-menua, #play_eszena').length; // x elementos -> x callback
          angular.element('.goiko-menua, #play_eszena').fadeOut(0, function() {

            if (--zenbat > 0) return; // si no es el último callback nos piramos

            play_ipuina(false);

          });

        }

      });

    }

  };

  $scope.bideo_modua_stop = function() {
    angular.element('#xuria').hide();
    audioa_kill();
    // Ikonoa aldatu
    Funtzioak.botoia_animatu(angular.element('.stop_erakutsi'), 'images/ikonoak/stop.png', 'images/ikonoak/stop-press.png');
    Funtzioak.botoia_animatu(angular.element('.atzera_erakutsi'), 'images/ikonoak/stop.png', 'images/ikonoak/stop-press.png');
    $scope.soinuak.audio_play('click');
    if ($scope.bideo_modua.playing) {

      if ($scope.bideo_modua.timer !== undefined)
        $scope.bideo_modua.timer.stop();

      $timeout.cancel(portadaTimeout);
      $timeout.cancel(kontrazalaTimeout);

      // Paramos la posible reproducción del audio
      Audio.geratuMakinak();
      Audio.stopMp3(); // kontrazalaren audioa gelditzeko

      // Desbloqueamos los objetos/textos de la eszena
      $scope.$broadcast("bideo_modua_off");

      $scope.bideo_modua.playing = false;
      lock_play = false;

      angular.element('.play_gorde').fadeIn(1000, function() {});
      angular.element('.stop_erakutsi').fadeOut(1000, function() {});
      angular.element('.atzera_erakutsi').fadeOut(1000, function() {});
      angular.element('#elkarbanatu').fadeOut(1000, function() {});

      $scope.changeEszena($scope.eszenak[0]);
    }
  };

  $scope.atzera = function(id) {
    Funtzioak.botoia_animatu(angular.element('#atzera_joan'), 'images/ikonoak/atzera.png', 'images/ikonoak/atzera-press.png');
    $scope.soinuak.audio_play('click');
    $timeout(function() {
      $location.url('/ipuinak/' + id);
    }, 500);
  };

  function portada() {
    $scope.bideo_modua.playing = true;
    clearEszena();
    changeFondoa({
      fullPath: 'images/ipuin-azala.png'
    });
    $scope.playAudioa({
      audioa: 'assets/audioak/azala.mp3'
    });
    angular.element('#portada_izenburua').show('slow');
    portadaTimeout = $timeout(function() {}, 3000);


    return portadaTimeout;
  }

  function kontrazala() {
    angular.element('#elkarbanatu').attr('src', 'images/ikonoak/elkarbanatu.png');
    $scope.bideo_modua.playing = true;
    //clearEszena();
    angular.element('#xuria').hide();
    angular.element('.stop_erakutsi').fadeOut(1000, function() {});
    angular.element('.atzera_erakutsi').fadeIn(1000, function() {});
    /*
    changeFondoa({
      fullPath: 'images/ipuin-kontrazala.png'
    });
    $scope.playAudioa({
      audioa: 'assets/audioak/kalabazan.mp3'
    });
    */
    angular.element('#elkarbanatu').show('slow');
    kontrazalaTimeout = $timeout(function() {}, 8000);
    return kontrazalaTimeout;
  }

  function play_ipuina(osorik) {
    osorik = typeof osorik !== 'undefined' ? osorik : true;
    var xuria = angular.element('#xuria');
    xuria.removeClass('xuria_gorde');
    var lapso = 5; // Numero de segundos minimo entre una eszena y la siguiente
    xuria.show();
    xuria.addClass('xuria_gorde');

    if ($scope.bideo_modua.uneko_eszena < $scope.eszenak.length) {
      $scope.bideo_modua.playing = true;

      if ($scope.bideo_modua.timer !== undefined)
        $scope.bideo_modua.timer.stop();
      console.log('play_ipuina', $scope.eszenak[$scope.bideo_modua.uneko_eszena]);
      Audio.getDuration($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa, $scope.eszenak[$scope.bideo_modua.uneko_eszena].cordova_file).then(function(iraupena) {
        lapso = Math.max(lapso, iraupena);
        $scope.changeEszena($scope.eszenak[$scope.bideo_modua.uneko_eszena], true).then(function() {
          // Ojete: puede que en lo que se tarda en cargar la eszena se haya parado la reproducción....
          if ($scope.bideo_modua.playing) {
            if (iraupena > 0)
              Audio.play($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa, $scope.eszenak[$scope.bideo_modua.uneko_eszena].cordova_file);

            $scope.bideo_modua.timer = new Funtzioak.Timer(function() {
              if (osorik) {
                $scope.bideo_modua.uneko_eszena++;
                play_ipuina();
              } else {
                $scope.bideo_modua_stop();
              }
            }, lapso * 1000);
            if (inBackground)
              pause_ipuina();
          }
        }, function(error) {
          console.log("IpuinaCtrl, play_ipuina changeEszena audiokin", error);

          $scope.bideo_modua_stop();
        });

      }, function() {
        $scope.changeEszena($scope.eszenak[$scope.bideo_modua.uneko_eszena], true).then(function() {
          // Ojete: puede que en lo que se tarda en cargar la eszena se haya parado la reproducción....
          if ($scope.bideo_modua.playing) {
            $scope.bideo_modua.timer = new Funtzioak.Timer(function() {
              if (osorik) {
                $scope.bideo_modua.uneko_eszena++;
                play_ipuina();
              } else {
                $scope.bideo_modua_stop();
              }
            }, lapso * 1000);
            if (inBackground)
              pause_ipuina();

          }
        }, function(error) {
          console.log("IpuinaCtrl, play_ipuina changeEszena audio gabe", error);
          $scope.bideo_modua_stop();
        });
      });
    } else {
      // Hemos llegado al final -> desactivamos el timer y nos quedamos en la última eszena
      kontrazala().then(function() {


        // Cargamos la primera eszena
        //$scope.changeEszena($scope.eszenak[0]);
        //$scope.bideo_modua_stop();
      }, function(err) {
        console.log('error ', err);
        angular.element('#elkarbanatu').hide();

        // Cargamos la primera eszena
        $scope.changeEszena($scope.eszenak[0]);

        $scope.bideo_modua_stop();
      });
    }

  }

  function pause_ipuina() {

    if ($scope.bideo_modua.timer !== undefined)
      $scope.bideo_modua.timer.pause();

    if (Audio.egoera() == 'play')
      Audio.pause();

  }

  function resume_ipuina() {

    if ($scope.bideo_modua.timer !== undefined)
      $scope.bideo_modua.timer.resume();

    if (Audio.egoera() == 'pause')
      Audio.play($scope.eszenak[$scope.bideo_modua.uneko_eszena].audioa, $scope.eszenak[$scope.bideo_modua.uneko_eszena].cordova_file);

  }

  var onError = function(err) {

    console.log('err', err);

  };

  document.addEventListener('deviceready', function() {
    init();
  });

  document.addEventListener('pause', function() {
    inBackground = true;
    if ($scope.bideo_modua.playing) {
      pause_ipuina();
    } else
      audioa_kill(); // Paramos la posible reproducción/grabación del audio
  });

  document.addEventListener('resume', function() {

    inBackground = false;

    if ($scope.bideo_modua.playing) {

      resume_ipuina();

    }

  });

  $scope.$on("$destroy", function() {

    // Limpiamos la eszena
    clearEszena();

    // Paramos la posible reproducción/grabación del audio
    audioa_kill();

    // Paramos la posible reproducción del cuento
    $scope.bideo_modua_stop();


    destroyed = true;

  });

}]);
