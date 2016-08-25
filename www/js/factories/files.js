app.factory('Files', ['$cordovaFile', '$cordovaDevice', '$q', function($cordovaFile, $cordovaDevice, $q){
  var Files = {};
  Files.saveFile = function(image) {
    var d = $q.defer();
    switch ($cordovaDevice.getPlatform()) {
      case 'iOS':
        var name = image.split('/').pop();
        $cordovaFile.moveFile(cordova.file.tempDirectory, name, cordova.file.dataDirectory, name).then(function(){
          d.resolve(cordova.file.dataDirectory + name);
        }, function(err){
          d.reject(err);
        });
        break;
      case 'Android':        
      default:
        d.resolve(image);
        break;
    }
    return d.promise;    
  };
  Files.getFiles = function(){
    
  };
  return Files;
}]);