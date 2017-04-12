app.controller('ModalIpuinaDatuakCtrl', ['$scope', '$uibModalInstance', '$cordovaDialogs', 'Database', 'Ipuinak', 'erabiltzailea_id', 'ipuina_id', function($scope, $uibModalInstance, $cordovaDialogs, Database, Ipuinak, erabiltzailea_id, ipuina_id) {

  $scope.eremuak = {
    izenburua: ''
  };
  $scope.submit = false;
  $scope.ezabatu_button = false;
  $scope.errore_mezua = '';

  $scope.init = function() {

    // Recogemos los datos del ipuina
    Database.query('SELECT izenburua FROM ipuinak WHERE id=?', [parseInt(ipuina_id)]).then(function(ipuina) {

      if (ipuina.length === 1) {

        $scope.eremuak.izenburua = ipuina[0].izenburua;
        $scope.ezabatu_button = true;

      }

    }, function(error) {
      console.log("ModalIpuinaDatuakCtrl, select ipuina", error);
    });

  };

  $scope.ipuina_gorde = function(form) {
    //console.log ("time", Math.floor(Date.now() / 1000));

    $scope.submit = true;

    if (form.$valid) {

      // Comprobamos que no exista el ipuina para el erabiltzaile
      Database.query('SELECT id FROM ipuinak WHERE fk_erabiltzailea=? AND UPPER(izenburua)=? AND id<>?', [erabiltzailea_id, $scope.eremuak.izenburua.toUpperCase(), ipuina_id]).then(function(emaitza) {

        if (emaitza.length === 0) {

          // Guardamos los datos en la base de datos (insertar/modificar)
          if (ipuina_id === 0) {

            Database.insertRow('ipuinak', {
              'izenburua': $scope.eremuak.izenburua,
              'fk_erabiltzailea': erabiltzailea_id
            }).then(function(emaitza) {

              // Cerramos la ventana modal
              $uibModalInstance.close();

              // Desactivamos el control de cambio de estado para poder redireccionar (ver función más abajo)
              $scope.offLocationChangeStart();

              // Redireccionamos a la pantalla del ipuina
              window.location = "#/ipuinak/" + erabiltzailea_id + "/" + emaitza.insertId;

              //$uibModalInstance.close (emaitza.insertId);

            }, function(error) {
              console.log("ModalIpuinaDatuakCtrl, ipuina_gorde insert", error);
            });

          } else {

            Database.query('UPDATE ipuinak SET izenburua=? WHERE id=?', [$scope.eremuak.izenburua, ipuina_id]).then(function() {

              $uibModalInstance.close(ipuina_id);

            }, function(error) {
              console.log("ModalIpuinaDatuakCtrl, ipuina_gorde update", error);
              $scope.itxi();
            });

          }

        } else
          $scope.errore_mezua = 'Ipuina existitzen da. Ezin da errepikatu.';

      }, function(error) {
        console.log("ModalIpuinaDatuakCtrl, ipuina existitzen dela konprobatzen", error);
      });

    }

  };

  $scope.ipuina_ezabatu = function() {

    $cordovaDialogs.confirm('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then(function(buttonIndex) {

      if (buttonIndex == 1) {

        Ipuinak.ezabatu_ipuina(ipuina_id).then(function() {

          $uibModalInstance.close('ezabatu');

        }, function(error) {
          console.log("ModalIpuinaDatuakCtrl, ezabatu_ipuina", error);
        });

      }

    }, function(error) {
      console.log("ModalIpuinaDatuakCtrl, ipuina_ezabatu dialog", error);
    });

  };

  $scope.itxi = function() {

    $uibModalInstance.dismiss('itxi');

  };

  // Controlamos el cambio de estado para cerrar la ventana (cuando se da atrás en el botón del sistema)
  $scope.offLocationChangeStart = $scope.$on('$locationChangeStart', function(event) {

    event.preventDefault();
    $scope.itxi();

  });

  document.addEventListener('deviceready', function() {

    $scope.init();

  });

}]);
