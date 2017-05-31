app.factory('Files', ['$cordovaFile', '$cordovaDevice', '$q', 'Funtzioak', function($cordovaFile, $cordovaDevice, $q, Funtzioak) {
  var Files = {};
  var fitxategiaGorde = function(path, name, argazkia) {
    var d = $q.defer();
    $cordovaFile.writeFile(path, name, argazkia, true).then(function(res){
      console.log('ongi', path, name);
      d.resolve();
    }, function(err){
      console.log('err writeFile', err);
      d.reject(err);
    });
    return d.promise;
  }
  Files.saveBase64ImageThumbnail = function(original_file, base64_file) {
    var d = $q.defer();
    var o_file = original_file.split('/');
    var name = o_file.pop();
    var path = cordova.file.dataDirectory+'miniaturak';
    var argazkia = Funtzioak.dataURItoBlob(base64_file);

    $cordovaFile.checkDir(cordova.file.dataDirectory, 'miniaturak').then(function(res) {
      if(res.isDirectory == true) {
        fitxategiaGorde(path, name, argazkia).then(function() {
          d.resolve();
        }, function(err) {
          console.log(err);
          d.reject(err);
        });
      } else {
        $cordovaFile.createDir(cordova.file.dataDirectory, 'miniaturak').then(function(res) {
          fitxategiaGorde(path, name, argazkia).then(function() {
            d.resolve();
          }, function(err) {
            console.log(err);
            d.reject(err);
          });
        }, function(err) {
           fitxategiaGorde(path, name, argazkia).then(function() {
             d.resolve();
           }, function(err) {
             console.log(err);
             d.reject(err);
           });
        });
      }
    }, function(err) {
      console.log(err);
      d.reject(err);
    });
    return d.promise;
  };

  Files.saveBase64Image = function(original_file, base64_file) {
    var d = $q.defer();
    var o_file = original_file.split('/');
    var name = o_file.pop();
    var path = cordova.file.dataDirectory;
    var argazkia = Funtzioak.dataURItoBlob(base64_file);

    fitxategiaGorde(path, name, argazkia).then(function() {
      d.resolve();
    }, function(err) {
      console.log(err);
      d.reject(err);
    });
    return d.promise;
  };

  Files.saveFile = function(fitxategia) {
    var d = $q.defer();

    var fitx_path = fitxategia.split('/').slice(0, -1).join('/');
    var fitx_name = fitxategia.split('/').pop();

    if (fitx_path.length > 0) {

      if (fitx_path[0] == '/')
        fitx_path = 'file://' + fitx_path;

      $cordovaFile.copyFile(fitx_path, fitx_name, cordova.file.dataDirectory, fitx_name).then(function() {

        d.resolve(fitx_name);

      }, function(error) {
        d.reject(error);
      });

    } else
      d.reject('fitxategiaren path-a ezin jaso [' + fitxategia + ']');

    return d.promise;
  };

  Files.getFiles = function() {};

  return Files;

}]);
