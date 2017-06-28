app.controller('ModalErabiltzaileaDatuakCtrl', ['$q', '$scope', '$uibModalInstance', '$cordovaDialogs', '$cordovaFile', 'Database', 'Ipuinak', 'Kamera', 'Files', 'erabiltzailea_id', function($q, $scope, $uibModalInstance, $cordovaDialogs, $cordovaFile, Database, Ipuinak, Kamera, Files, erabiltzailea_id) {

  $scope.eremuak = {
    izena: '',
    argazkia: ''
  };
  $scope.submit = false;
  $scope.ezabatu_button = false;
  $scope.errore_mezua = '';
  $scope.argazkia_fullPath = '';

  var jatorrizko_argazkia = '';

  $scope.init = function() {

    // Recogemos los datos del erabiltzaile
    Database.query('SELECT izena, argazkia FROM erabiltzaileak WHERE id=?', [parseInt(erabiltzailea_id)]).then(function(erabiltzailea) {

      if (erabiltzailea.length === 1) {

        $scope.eremuak.izena = erabiltzailea[0].izena;
        $scope.eremuak.argazkia = jatorrizko_argazkia = erabiltzailea[0].argazkia;

        if (erabiltzailea[0].argazkia.trim() !== '')
          $scope.argazkia_fullPath = cordova.file.dataDirectory + erabiltzailea[0].argazkia;

        $scope.ezabatu_button = true;

      }

    }, function(error) {
      console.log("ModalErabiltzaileaDatuakCtrl, select erabiltzailea", error);
    });

  };

  $scope.erabiltzailea_gorde = function(form) {
    //console.log ("time", Math.floor(Date.now() / 1000));

    $scope.submit = true;

    if (form.$valid) {

      // Comprobamos que no exista el erabiltzaile
      Database.query('SELECT id FROM erabiltzaileak WHERE UPPER(izena)=? AND id<>?', [$scope.eremuak.izena.toUpperCase(), erabiltzailea_id]).then(function(emaitza) {

        if (emaitza.length === 0) {

          // Comprobamos si ha cambiado la imagen para borrar la anterior
          if ($scope.eremuak.argazkia.trim() !== '' && jatorrizko_argazkia.trim() !== '' && $scope.eremuak.argazkia != jatorrizko_argazkia)
            remove_argazkia(jatorrizko_argazkia);

          // Guardamos los datos en la base de datos (insertar/modificar)
          if (erabiltzailea_id === 0) {

            Database.insertRow('erabiltzaileak', {
              'izena': $scope.eremuak.izena,
              'argazkia': $scope.eremuak.argazkia
            }).then(function(emaitza) {

              // Cerramos la ventana modal
              $uibModalInstance.close();

              // Desactivamos el control de cambio de estado para poder redireccionar (ver función más abajo)
              $scope.offLocationChangeStart();

              // Redireccionamos a la pantalla con la lista de ipuinak del usuario
              window.location = "#/ipuinak/" + emaitza.insertId;

              //$uibModalInstance.close (emaitza.insertId);

            }, function(error) {
              console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_gorde insert", error);
            });

          } else {

            Database.query('UPDATE erabiltzaileak SET izena=?, argazkia=? WHERE id=?', [$scope.eremuak.izena, $scope.eremuak.argazkia, erabiltzailea_id]).then(function() {

              $uibModalInstance.close(erabiltzailea_id);

            }, function(error) {
              console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_gorde update", error);
              $scope.itxi();
            });

          }

        } else
          $scope.errore_mezua = 'Erabiltzailea existitzen da. Ezin da errepikatu.';

      }, function(error) {
        console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea existitzen dela konprobatzen", error);
      });

    }

  };

  $scope.erabiltzailea_ezabatu = function() {

    $cordovaDialogs.confirm('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then(function(buttonIndex) {

      if (buttonIndex == 1) {

        // Recogemos/Borramos los ipuinak del erabiltzaile
        Database.getRows('ipuinak', {
          'fk_erabiltzailea': erabiltzailea_id
        }, '').then(function(ipuinak) {

          angular.forEach(ipuinak, function(ipuina) {

            Ipuinak.ezabatu_ipuina(ipuina.id);

          });

          // Borramos la imagen del erabiltzaile (puede que haya dos en este mismo momento)
          if ($scope.eremuak.argazkia.trim() !== '')
            remove_argazkia($scope.eremuak.argazkia);

          if ($scope.eremuak.argazkia != jatorrizko_argazkia && jatorrizko_argazkia.trim() !== '')
            remove_argazkia(jatorrizko_argazkia);

          // Borramos los datos del erabiltzaile
          Database.deleteRows('erabiltzaileak', {
            'id': erabiltzailea_id
          }).then(function() {

            $uibModalInstance.close('ezabatu');

          }, function(error) {
            console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu erabiltzailea ezabatzerakoan", error);
          });

        }, function(error) {
          console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu ipuinak jasotzen", error);
        });

      }

    }, function(error) {
      console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu dialog", error);
    });

  };

  $scope.itxi = function() {

    if ($scope.eremuak.argazkia.trim() !== '' && $scope.eremuak.argazkia != jatorrizko_argazkia)
      remove_argazkia($scope.eremuak.argazkia);

    //$uibModalInstance.dismiss ('itxi');
    $uibModalInstance.close('itxi'); // ahora, con lo de la imagen de usuario, necesito recargar los datos al cerrar la modal

  };

  $scope.takePicture = function() {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      cameraDirection: 1,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };

    Kamera.getPicture(options).then(function(irudia) {

      Files.saveFile(irudia).then(function(irudia) {

        if ($scope.eremuak.argazkia.trim() !== '' && $scope.eremuak.argazkia != jatorrizko_argazkia)
          remove_argazkia($scope.eremuak.argazkia);

        $scope.eremuak.argazkia = irudia;
        $scope.argazkia_fullPath = cordova.file.dataDirectory + irudia;

      }, function(error) {
        console.log("ModalErabiltzaileaDatuakCtrl, takePicture saveFile", error);
      });

    }, function(error) {
      console.log("ModalErabiltzaileaDatuakCtrl, takePicture getPicture", error);
    });

  };

  $scope.argazkia_ezabatu = function() {

    $cordovaDialogs.confirm('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then(function(buttonIndex) {

      if (buttonIndex == 1) {

        remove_argazkia($scope.eremuak.argazkia).then(function() {

          if ($scope.eremuak.argazkia != jatorrizko_argazkia && jatorrizko_argazkia.trim() !== '') {
            $scope.eremuak.argazkia = jatorrizko_argazkia;

            $scope.argazkia_fullPath = cordova.file.dataDirectory + jatorrizko_argazkia;
          } else {
            $scope.eremuak.argazkia = jatorrizko_argazkia = $scope.argazkia_fullPath = '';

            // Ojo cuidau: Al borrar la original hay que modificar la base de datos porque si luego se cierra la ventana en vez de guardar nos la lian....
            if (erabiltzailea_id !== 0) {

              Database.query("UPDATE erabiltzaileak SET argazkia='' WHERE id=?", [erabiltzailea_id]).then(function() {}, function(error) {
                console.log("ModalErabiltzaileaDatuakCtrl, argazkia_ezabatu update", error);
              });

            }
          }

        });

      }

    }, function(error) {
      console.log("ModalErabiltzaileaDatuakCtrl, erabiltzailea_ezabatu dialog", error);
    });

  };

  function remove_argazkia(izena) {
    var d = $q.defer();

    $cordovaFile.removeFile(cordova.file.dataDirectory, izena).then(function() {
      //console.log ("ezabata!", izena);
      d.resolve();
    }, function(error) {
      console.log("ModalErabiltzaileaDatuakCtrl, remove_argazkia", error);
      d.reject(error);
    });

    return d.promise;
  }

  // Controlamos el cambio de estado para cerrar la ventana (cuando se da atrás en el botón del sistema)
  $scope.offLocationChangeStart = $scope.$on('$locationChangeStart', function(event) {

    event.preventDefault();
    $scope.itxi();

  });

  document.addEventListener('deviceready', function() {

    $scope.init();

  });

}]);
