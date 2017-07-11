app.factory('Upload', ['Database', 'Funtzioak', '$q', '$http', '$cordovaFileTransfer', '$cordovaDevice', function(Database, Funtzioak, $q, $http, $cordovaFileTransfer, $cordovaDevice) {
  var Upload = {};
  var ipuina;
  var server = 'http://www.haziak.eus/jquery/app-kontaklik/partekatu';

  var onError = function(err) {
    console.log(err);
  };

  var onProgress = function(progress) {
    //console.log(Math.round((progress.loaded / progress.total) * 10000) / 100);
  };

  var getEszenaDatuak = function(eszena, ind) {
    var d = $q.defer();
    Database.getRows('irudiak', {
      'atala': 'fondoa',
      'id': eszena.fk_fondoa
    }, '').then(function(emaitza) {
      if (emaitza.length > 0) {
        ipuina.eszenak[ind].fondoa = emaitza[0];
        ipuina.eszenak[ind].fondoa.fullPath = Funtzioak.get_fullPath(emaitza[0]);
      }
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
    }, function(err) {
      onError();
      d.reject(err);
    });
    return d.promise;
  };

  var igotzenHasi = function() {
    //console.log('ipuina', ipuina);
    $http({ method: 'POST', url: server, data:ipuina }).then(function(res) {
      //console.log('POST', res);

      if (ipuina.eszenak.length > 0 && res.status === 200 && res.data.cod === 0) {
        // Erabiltzaile argazkia igo
        if (ipuina.erabiltzailea.argazkia.trim () !== '') {
          var targetPath = cordova.file.dataDirectory + ipuina.erabiltzailea.argazkia;
          var options = {
            fileKey: "file",
            fileName: ipuina.erabiltzailea.argazkia,
            chunkedMode: false,
            params : {'mota':'argazkia', 'izena':ipuina.erabiltzailea.argazkia, 'erabiltzailea_id': ipuina.erabiltzailea.id, 'ipuina_id':ipuina.datuak.id, 'uuid':ipuina.uuid}
          };

          $cordovaFileTransfer.upload(server, targetPath, options, true).then(function(res) {
            console.log('erabiltzaile argazkia upload ongi!', res);
          }, function(err) {
            console.log('cordovaFileTransfer.upload erabiltzaile argazkia', err);
          }, onProgress);
        }

        // Eszena bakoitzaren gauzak igo
        ipuina.eszenak.forEach(function(eszena) {

          // 1. Fondoa
          if (eszena.fondoa !== undefined) {
            var options = {
              fileKey: "file",
              fileName: eszena.fondoa.izena,
              chunkedMode: false,
              params : {'mota':'fondoa', 'izena':eszena.fondoa.izena, 'erabiltzailea_id': ipuina.erabiltzailea.id, 'ipuina_id':ipuina.datuak.id, 'uuid':ipuina.uuid}
            };

            $cordovaFileTransfer.upload(server, eszena.fondoa.fullPath, options, true).then(function(res) {
              console.log('fondoa upload ongi!', res);
            }, function(err) {
              console.log('cordovaFileTransfer.upload fondoa', err);
            }, onProgress);
          }

          // 2. Objektuak
          if (eszena.eszena_objektuak !== undefined && eszena.eszena_objektuak.length > 0) {
            eszena.eszena_objektuak.forEach(function(objektua) {
              var targetPath = Funtzioak.get_fullPath(objektua);
              var options = {
                fileKey: "file",
                fileName: objektua.izena,
                chunkedMode: false,
                params : {'mota':'objektua', 'izena':objektua.izena, 'erabiltzailea_id': ipuina.erabiltzailea.id, 'ipuina_id':ipuina.datuak.id, 'uuid':ipuina.uuid}
              };

              $cordovaFileTransfer.upload(server, targetPath, options, true).then(function(res) {
                console.log('objektua upload ongi!', res);
              }, function(err) {
                console.log('cordovaFileTransfer.upload objektua', err);
              }, onProgress);
            });
          }

          // 3. Bokadiloak
          if (eszena.eszena_testuak !== undefined && eszena.eszena_testuak.length > 0) {
            eszena.eszena_testuak.forEach(function(testua) {
              var targetPath = Funtzioak.get_fullPath(testua);
              var options = {
                fileKey: "file",
                fileName: testua.izena,
                chunkedMode: false,
                params : {'mota':'bokadiloa', 'izena':testua.izena, 'erabiltzailea_id': ipuina.erabiltzailea.id, 'ipuina_id':ipuina.datuak.id, 'uuid':ipuina.uuid}
              };

              $cordovaFileTransfer.upload(server, targetPath, options, true).then(function(res) {
                console.log('bokadiloa upload ongi!', res);
              }, function(err) {
                console.log('cordovaFileTransfer.upload bokadiloa', err);
              }, onProgress);
            });
          }

          // 4. Audioa
          if (eszena.audioa.trim () !== '') {
            var targetPath = eszena.cordova_file == 'dataDirectory'? cordova.file.dataDirectory + 'audioak/' + eszena.audioa_osoa : cordova.file.applicationDirectory + 'www/' + eszena.audioa_osoa;

            var options = {
              fileKey: "file",
              fileName: eszena.audioa,
              chunkedMode: false,
              params : {'mota':'audioa', 'izena':eszena.audioa, 'erabiltzailea_id': ipuina.erabiltzailea.id, 'ipuina_id':ipuina.datuak.id, 'uuid':ipuina.uuid}
            };

            $cordovaFileTransfer.upload(server, targetPath, options, true).then(function(res) {
              console.log('audioa upload ongi!', res);
            }, function(err) {
              console.log('cordovaFileTransfer.upload audioa', err);
            }, onProgress);
          }

        });
      }
    }, onError);
  };

  Upload.ipuinaIgo = function(erabiltzaile_id, ipuina_id) {
    var d = $q.defer();
    //console.log('ipuinaIgo', ipuina_id, erabiltzaile_id);
    ipuina = {};
    var promises = [];
    if (ipuina_id > 0 && erabiltzaile_id > 0) {
      ipuina.uuid = $cordovaDevice.getUUID();
      //console.log('ipuina.uuid ', erabiltzaile_id);
      Database.getRows('erabiltzaileak', {
        'id': erabiltzaile_id
      }, '').then(function(emaitza) {
        //console.log('erabiltzailea', emaitza);
        if (emaitza.length === 1) {
          //console.log('erabiltzailea', erabiltzaile_id);
          ipuina.erabiltzailea = emaitza[0];
          // Recogemos los datos del ipuina
          Database.getRows('ipuinak', {
            'fk_erabiltzailea': erabiltzaile_id,
            'id': ipuina_id
          }, '').then(function(emaitza) {
            if (emaitza.length === 1) {
              //console.log('ipuinak', emaitza[0]);
              ipuina.datuak = emaitza[0];
              ipuina.tamaina = {
                zabalera: window.screen.width,
                altuera: window.screen.height
              };
              Database.query("SELECT e.*, ifnull(i.cordova_file, '') cordova_file_fondoa, ifnull(i.path, '') path, ifnull(i.izena, '') izena FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [ipuina.datuak.id]).then(function(eszenak) {
                ipuina.eszenak = eszenak;
                if (eszenak.length > 0) {
                  eszenak.forEach(function(eszena, ind) {
                    // Audioaren path osoa gorde eta izena banatu eginen dugu
                    eszena.audioa_osoa = eszena.audioa;
                    eszena.audioa = eszena.cordova_file == 'applicationDirectory'? eszena.audioa.split('/').pop(): eszena.audioa;

                    promises.push(getEszenaDatuak(eszena, ind));
                  });
                  $q.all(promises).then(function() {
                    igotzenHasi();
                    d.resolve();
                  }, function(err) {
                    d.reject(err);
                  });
                }
              }, function(err) {
                d.reject(err);
              });
            }
          }, function(err) {
            d.reject(err);
          });
        }
      }, function(err) {
        d.reject(err);
      });
    }
    return d.promise;
  };

  return Upload;

}]);
