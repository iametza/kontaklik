app.factory('Upload',['Database', 'Funtzioak', '$q', '$http', '$cordovaFileTransfer', function(Database, Funtzioak, $q, $http, $cordovaFileTransfer) {
  var Upload = {};
  var ipuina = [];
  var url = 'http://haziak.ametza.com/uploads';

  var onError = function(err) {
    console.log(err);
  };
  var getEszenaDatuak = function(eszena) {
    var d = $q.defer();
    Database.getRows('irudiak', {
      'atala': 'fondoa',
      'id': eszena.fk_fondoa
    }, '').then(function(emaitza) {
      ipuina.eszenak[ind].irudiak = emaitza;
      // Cargamos sus objetos
      Database.getRows('eszena_objektuak', {
        'fk_eszena': eszena.id
      }, ' ORDER BY id ASC').then(function(objektuak) {
        ipuina.eszenak[ind].eszena_objektuak = objektuak;
        // Cargamos sus textos
        Database.getRows('eszena_testuak', {
          'fk_eszena': eszena.id
        }, ' ORDER BY id ASC').then(function(testuak) {
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
  }
  var igotzenHasi = function() {
       $http({ method: 'POST', url: url, params: ipuina });

  };
  Upload.ipuinaIgo = function(ipuina_id, erabiltzaile_id){
    ipuina = [];
    var promises = [];
    if(ipuina_id > 0 && erabiltzaile_id > 0) {
      // Recogemos los datos del ipuina
      Database.getRows('ipuinak', {
        'fk_erabiltzailea': ipuina_id,
        'id': erabiltzaile_id
      }, '').then(function(emaitza) {
        if (emaitza.length === 1) {
          ipuina = emaitza[0];
          ipuina.tamaina = { zabalera: window.screen.width, altuera: window.screen.height}
          Database.query("SELECT e.*, ifnull(i.cordova_file, '') cordova_file, ifnull(i.path, '') path, ifnull(i.izena, '') izena FROM eszenak e LEFT JOIN irudiak i ON i.id=e.fk_fondoa AND i.atala='fondoa' WHERE e.fk_ipuina=? ORDER BY e.orden ASC", [ipuina.id]).then(function(emaitza) {
            ipuina.eszenak = emaitza;
            // Establecemos el path completo y 'real'
            angular.forEach(eszenak, function(eszena, ind) {
              ipuina.eszenak[ind].fondoa_fullPath = Funtzioak.get_fullPath(eszena);
              // Empezamos con el fondo
              promises.push(getEszenaDatuak(eszena));
            });
          }, onError);
        }
      }, onError);
      $q.all(promises).then(igotzenHasi, onError);
    }
  };
  return Upload;
});
