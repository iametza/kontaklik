app.factory('Upload', ['Database', 'Funtzioak', '$q', '$http', '$cordovaFileTransfer', '$cordovaDevice', function(Database, Funtzioak, $q, $http, $cordovaFileTransfer, $cordovaDevice) {
  var Upload = {};
  var ipuina;
  var server = 'http://haziak.ametza.com/upload.php';

  var onError = function(err) {
    console.log(err);
  };
  var onProgress = function(progress) {
    console.log(Math.round((progress.loaded / progress.total) * 10000) / 100);
  }
  var getEszenaDatuak = function(eszena, ind) {
    var d = $q.defer();
    Database.getRows('irudiak', {
      'atala': 'fondoa',
      'id': eszena.fk_fondoa
    }, '').then(function(emaitza) {
      if (emaitza.length > 0) {
        ipuina.eszenak[ind].fondoa = emaitza[0];
        ipuina.eszenak[ind].fondoa.fullPath = Funtzioak.get_fullPath(emaitza[0]);
        // Cargamos sus objetos
        Database.query('SELECT i.cordova_file, i.path, i.izena, eo.* FROM eszena_objektuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.fk_eszena=?', [eszena.id]).then(function(objektuak) {
          ipuina.eszenak[ind].eszena_objektuak = objektuak;
          // Cargamos sus textos
          Database.query('SELECT i.cordova_file, i.path, i.izena, eo.* FROM eszena_testuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.fk_eszena=?', [eszena.id]).then(function(testuak) {
            ipuina.eszenak[ind].eszena_testuak = testuak;
            d.resolve();
          }, function(err) {
            onError();
            d.reject(err);
          });
        }, function(err) {
          onError();
          d.reject(err);
        });
      } else {
        d.resolve();
      }
    }, function(err) {
      onError();
      d.reject(err);
    });
    return d.promise;
  }
  var igotzenHasi = function() {
    console.log('ipuina', ipuina);
    $http({ method: 'POST', url: server, data:ipuina }).then(function(res) {
      console.log('POST', res);
      /*
      if (ipuina.eszenak.length > 0 && res.status === 200) {
        ipuina.eszenak.forEach(function(eszena) {
          if (eszena.fondoa) {
            var datuak = {
              mota: 'fondoa',
              datuak: eszena.fondoa,
              ipuina_id: ipuina.datuak.id,
              uuid: ipuina.uuid
            };
            $cordovaFileTransfer.upload(server, eszena.fondoa.fullPath, datuak, true).then(function(res) {
              console.log('fondoa upload ongi!');
            }, function(err) {
              console.log('cordovaFileTransfer.upload objektua', err);
            }, onProgress);
          }
          if (eszena.eszena_objektuak.length > 0) {
            eszena.eszena_objektuak.forEach(function(objektua) {
              var targetPath = Funtzioak.get_fullPath(objektua);
              var fileName = targetPath.split('/').pop();
              var datuak = {
                mota: 'objektua',
                datuak: objektua,
                ipuina_id: ipuina.datuak.id,
                uuid: ipuina.uuid
              };
              $cordovaFileTransfer.upload(server, targetPath, datuak, true).then(function(res) {
                console.log('objektua upload ongi!');
              }, function(err) {
                console.log('cordovaFileTransfer.upload objektua', err);
              }, onProgress);
            });
          }
          if (eszena.eszena_testuak.length > 0) {
            eszena.eszena_testuak.forEach(function(testua) {
              var targetPath = Funtzioak.get_fullPath(testua);
              var fileName = targetPath.split('/').pop();
              var datuak = {
                mota: 'testua',
                datuak: testua,
                ipuina_id: ipuina.datuak.id,
                uuid: ipuina.uuid
              };
              $cordovaFileTransfer.upload(server, targetPath, datuak, true).then(function(res) {
                console.log('testua upload ongi!');
              }, function(err) {
                console.log('cordovaFileTransfer.upload testua', err);
              }, onProgress);
            });
          }
        });
      }*/
    }, onError);
  };
  Upload.ipuinaIgo = function(erabiltzaile_id, ipuina_id) {
    console.log('ipuinaIgo', ipuina_id, erabiltzaile_id);
    ipuina = {};
    var promises = [];
    if (ipuina_id > 0 && erabiltzaile_id > 0) {
      ipuina.uuid = $cordovaDevice.getUUID();
      console.log('ipuina.uuid ', erabiltzaile_id);
      Database.getRows('erabiltzaileak', {
        'id': erabiltzaile_id
      }, '').then(function(emaitza) {
        console.log('erabiltzailea', emaitza);
        if (emaitza.length === 1) {
          console.log('erabiltzailea', erabiltzaile_id);
          ipuina.erabiltzailea = emaitza[0];
          // Recogemos los datos del ipuina
          Database.getRows('ipuinak', {
            'fk_erabiltzailea': erabiltzaile_id,
            'id': ipuina_id
          }, '').then(function(emaitza) {
            if (emaitza.length === 1) {
              console.log('ipuinak', emaitza[0]);
              ipuina.datuak = emaitza[0];
              ipuina.tamaina = {
                zabalera: window.screen.width,
                altuera: window.screen.height
              };
              Database.query("SELECT e.*, ifnull(i.cordova_file, '') cordova_file, ifnull(i.path, '') path, ifnull(i.izena, '') izena FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [ipuina.datuak.id]).then(function(eszenak) {
                ipuina.eszenak = eszenak;
                if (eszenak.length > 0) {
                  eszenak.forEach(function(eszena, ind) {
                    // Empezamos con el fondo
                    promises.push(getEszenaDatuak(eszena, ind));
                  });
                  $q.all(promises).then(igotzenHasi, onError);
                }
              }, onError);
            }
          }, onError);
        }
      }, onError);
    }
  };
  return Upload;
}]);
