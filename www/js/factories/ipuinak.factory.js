app.factory('Ipuinak', ['$q', '$cordovaFile', 'Database', function($q, $cordovaFile, Database) {

  var Ipuinak = {};

  Ipuinak.ezabatu_eszena = function(eszena_id) {
    var d = $q.defer();

    // Empezamos comprobando/recogiendo los datos de la eszena
    Database.getRows('eszenak', {
      'id': eszena_id
    }, '').then(function(eszena) {

      if (eszena.length === 1) {

        // Empezamos borrando los objetos de la eszena
        Database.deleteRows('eszena_objektuak', {
          'fk_eszena': eszena_id
        }).then(function() {

          // Borramos los textos de la eszena
          Database.deleteRows('eszena_testuak', {
            'fk_eszena': eszena_id
          }).then(function() {

            // Borramos el audio de la eszena
            if (eszena[0].audioa.trim() !== '') {

              $cordovaFile.removeFile(cordova.file.dataDirectory, eszena[0].audioa).then(function() {}, function(error) {
                console.log("Ipuinak factory, ezabatu_eszena removeFile audioa", error);
              });

            }

            // Borramos los datos de la eszena
            Database.deleteRows('eszenak', {
              'id': eszena_id
            }).then(function() {

              d.resolve();

            }, function(error) {
              console.log("Ipuinak factory, ezabatu_eszena eszena ezabatzerakoan", error);
              d.reject(error);
            });

          }, function(error) {
            console.log("Ipuinak factory, ezabatu_eszena eszena_testuak ezabatzerakoan", error);
            d.reject(error);
          });

        }, function(error) {
          console.log("Ipuinak factory, ezabatu_eszena eszena_objektuak ezabatzerakoan", error);
          d.reject(error);
        });

      } else {
        console.log("Ipuinak factory, ezabatu_eszena eszena ezin jaso");
        d.reject('eszena ezin jaso');
      }

    }, function(error) {
      console.log("Ipuinak factory, ezabatu_eszena eszena datuak jasotzerakoan", error);
      d.reject(error);
    });

    return d.promise;
  };

  Ipuinak.ezabatu_ipuina = function(ipuina_id) {
    var d = $q.defer();
    var promiseak = [];

    // Recogemos/Borramos las eszenak del ipuina
    Database.getRows('eszenak', {
      'fk_ipuina': ipuina_id
    }, '').then(function(eszenak) {

      angular.forEach(eszenak, function(eszena) {

        promiseak.push(Ipuinak.ezabatu_eszena(eszena.id));

      });

      $q.all(promiseak).then(function() {

        // Borramos los datos del ipuina
        Database.deleteRows('ipuinak', {
          'id': ipuina_id
        }).then(function() {

          d.resolve();

        }, function(error) {
          console.log("Ipuinak factory, ezabatu_ipuina ipuina ezabatzerakoan", error);
          d.reject(error);
        });

      }, function(error) {
        console.log("Ipuinak factory, ezabatu_ipuina q.all error", error);
        d.reject(error);
      });

    }, function(error) {
      console.log("Ipuinak factory, ezabatu_ipuina eszenak jasotzen", error);
      d.reject(error);
    });

    return d.promise;
  };

  Ipuinak.eszenak_ordenatu = function(ipuina_id) {
    var d = $q.defer();
    var promiseak = [];

    // Recogemos las eszenak del ipuina
    Database.getRows('eszenak', {
      'fk_ipuina': ipuina_id
    }, ' ORDER BY orden ASC').then(function(eszenak) {

      angular.forEach(eszenak, function(eszena, ind) {

        promiseak.push(Database.query('UPDATE eszenak SET orden=? WHERE id=?', [ind + 1, eszena.id]));

      });

      $q.all(promiseak).then(function() {

        d.resolve();

      }, function(error) {
        console.log("Ipuinak factory, eszenak_ordenatu q.all error", error);
        d.reject(error);
      });

    }, function(error) {
      console.log("Ipuinak factory, eszenak_ordenatu eszenak jasotzen", error);
      d.reject(error);
    });

    return d.promise;
  };

  return Ipuinak;

}]);
