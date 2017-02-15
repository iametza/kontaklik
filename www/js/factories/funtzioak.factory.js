app.factory('Funtzioak', ['$q', '$timeout', '$compile', function($q, $timeout, $compile){
  
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
        d.reject (error);
      });
      
    }, function (error){
      d.reject (error);
    });
    
    return d.promise;
    
  };
  
  Funtzioak.baimenak_txek = function (){
    var d = $q.defer ();
    var permissions = ["WRITE_EXTERNAL_STORAGE", "RECORD_AUDIO"];
    
    document.addEventListener ('deviceready', function (){
      
      txek (permissions, 'ok');
        
    });
    
    function txek (baimenak, egoera){
    
      if (baimenak.length === 0)
        d.resolve (egoera);
      else{
        
        var baimena = baimenak[0];
        
        baimenak.shift ();
        
        cordova.plugins.diagnostic.getPermissionAuthorizationStatus (function (status){
          
          if (status != "GRANTED" && status != "DENIED_ALWAYS"){
            
            cordova.plugins.diagnostic.requestRuntimePermission (function (status){
              
              if (status == "GRANTED")
                txek (baimenak, egoera);
              else
                txek (baimenak, 'nok');
                
            }, function (error){
              d.reject (error);
            }, baimena);
            
          }
          else if (status == "GRANTED")
            txek (baimenak, egoera);
          else
            txek (baimenak, 'nok');
              
        }, function (error){
          d.reject (error);
        }, baimena);
        
      }
      
    }
    
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
  
  Funtzioak.show_lanean = function (scope){
    
    var elem = angular.element ('<div id="lanean"><img src="images/lanean.gif" /></div>');
    var el = $compile (elem)(scope);
    
    angular.element ('body').append (elem);
    scope.insertHere = el;
    
  };
  
  Funtzioak.hide_lanean = function (){
    
    angular.element ('#lanean').remove ();
    
  };
  
  return Funtzioak;

}]);