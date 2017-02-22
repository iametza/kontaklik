app.factory ('Files', ['$cordovaFile', '$cordovaDevice', '$q', function ($cordovaFile, $cordovaDevice, $q){
  
  var Files = {};
  
  Files.saveFile = function (fitxategia){
    var d = $q.defer();
    
    /*switch ($cordovaDevice.getPlatform()) {
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
    }*/
    
    var fitx_path = fitxategia.split ('/').slice (0, -1).join ('/');
    var fitx_name = fitxategia.split ('/').pop ();
    
    if (fitx_path.length > 0){
      
      if (fitx_path[0] == '/')
        fitx_path = 'file://' + fitx_path;
      
      $cordovaFile.copyFile (fitx_path, fitx_name, cordova.file.dataDirectory, fitx_name).then (function (){
        
        d.resolve (fitx_name);
        
      }, function (error){
        d.reject (error);
      });
    
    }
    else
      d.reject ('fitxategiaren path-a ezin jaso [' + fitxategia + ']');
        
    return d.promise;    
  };
  
  Files.getFiles = function (){};
  
  return Files;

}]);