app.factory('Funtzioak', ['$q', function($q){
  
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
        
        d.resolve (entries);
        
      }, function (error){
        console.log("Funtzioak factory listDir, readEntries", error);
        d.reject (error);
      });
      
    }, function (error){
      console.log("Funtzioak factory listDir, resolveLocalFileSystemURL", error);
      d.reject (error);
    });
    
    return d.promise;
    
  };
  
  return Funtzioak;

}]);