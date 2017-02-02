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
  
  Funtzioak.baimenak_txek = function (){
    var d = $q.defer ();
    var permissions = ["WRITE_EXTERNAL_STORAGE", "RECORD_AUDIO"];
    
    document.addEventListener ('deviceready', function (){
      
      txek (permissions, true);
        
    });
    
    function txek (baimenak, ok){
    
      console.log ("txek", baimenak, ok);
      
      if (baimenak.length === 0)
        d.resolve (ok);
      else{
        
        var baimenak_rest = baimenak.shift ();
        console.log (baimenak_rest);
        
        cordova.plugins.diagnostic.getPermissionAuthorizationStatus (function (status){
          
          if (status != "GRANTED" && status != "DENIED_ALWAYS"){
            
            cordova.plugins.diagnostic.requestRuntimePermission (function (status){
              
              if (status == "GRANTED")
                txek (baimenak_rest, ok);
              else
                txek (baimenak_rest, false);
                
            }, function (error){
              d.reject (error);
            }, baimenak[0]);
            
          }
          else if (status == "GRANTED")
            txek (baimenak_rest, ok);
          else
            txek (baimenak_rest, false);
              
        }, function (error){
          d.reject (error);
        }, baimenak[0]);
        
      }
      
    }
    
    return d.promise;
    
  };
  
  return Funtzioak;

}]);