app.factory ('Funtzioak', ['$q', '$timeout', function ($q, $timeout){
  
  var Funtzioak = {};
  
  Funtzioak.nl2br = function (str, is_xhtml){
    
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
  
  };
  
  Funtzioak.listDir = function (path){
    var d = $q.defer ();
    
    window.resolveLocalFileSystemURL (path, function (fileSystem){
      
      var reader = fileSystem.createReader ();
      
      reader.readEntries (function (entries){
        
        console.log (entries);
        
        // fitxategiak hartu bakarrik
        var fitxategiak = [];
        angular.forEach (entries, function (entry){
          if (entry.isFile)
            fitxategiak.push (entry);
        });
        
        console.log (fitxategiak);
        
        d.resolve (fitxategiak);
        
      }, function (error){
        d.reject (error);
      });
      
    }, function (error){
      d.reject (error);
    });
    
    return d.promise;
    
  };
  
  Funtzioak.Timer = function (callback, delay){
    var timerId, start, remaining = delay;
    
    this.pause = function (){
      $timeout.cancel (timerId);
      remaining -= new Date () - start;
    };
    
    this.resume = function (){
      start = new Date ();
      $timeout.cancel (timerId);
      timerId = $timeout (callback, remaining);
    };
    
    this.stop = function (){
      $timeout.cancel (timerId);
    };
    
    this.resume ();
  };
  
  Funtzioak.get_fullPath = function (fitxategia){
    var fullPath = '';
    
    if (fitxategia.hasOwnProperty ('cordova_file') &&
        fitxategia.hasOwnProperty ('path') &&
        fitxategia.hasOwnProperty ('izena') &&
        fitxategia.izena.trim () != ''){
      
      switch (fitxategia.cordova_file){
        case 'applicationDirectory':
          fullPath = cordova.file.applicationDirectory;
          break;
        case 'dataDirectory':
        default:
          fullPath = cordova.file.dataDirectory;
          break;
      }
      
      if (fitxategia.path.trim () != '')
        fullPath += fitxategia.path;
        
      fullPath += fitxategia.izena;
      
    }
    
    return (fullPath);
  };
  
  return Funtzioak;

}]);