app.factory ('Baimenak', ['$q', '$cordovaDialogs', function ($q, $cordovaDialogs){
  
  var Baimenak = {};
  
  Baimenak.konprobatu = function (){
    var d = $q.defer ();
    var permissions = ["WRITE_EXTERNAL_STORAGE", "RECORD_AUDIO"];
    
    document.addEventListener ('deviceready', function (){
      
      switch (device.platform){
        case 'iOS':
          ios_txek ();
          break;
        case 'Android':
          android_txek (permissions, 'ok');
          break;
        default:
          d.reject ('nok');
          break;
      }
      
    });
    
    function android_txek (baimenak, egoera){
      
      if (baimenak.length === 0)
        d.resolve (egoera);
      else{
        
        var baimena = baimenak[0];
        
        baimenak.shift ();
        
        cordova.plugins.diagnostic.getPermissionAuthorizationStatus (function (status){
          
          if (status != "GRANTED" && status != "DENIED_ALWAYS"){
            
            cordova.plugins.diagnostic.requestRuntimePermission (function (status){
              
              if (status == "GRANTED")
                android_txek (baimenak, egoera);
              else
                android_txek (baimenak, 'nok');
                
            }, function (error){
              d.reject (error);
            }, baimena);
            
          }
          else if (status == "GRANTED")
            android_txek (baimenak, egoera);
          else
            android_txek (baimenak, 'nok');
              
        }, function (error){
          d.reject (error);
        }, baimena);
        
      }
      
    } // android_txek
    
    // Las funciones usadas en android_txek son 'Android only', iOS god bless you. Pero, al Diablo gracias, en iOS con checkear s—lo el micro
    // es suficiente para poder usarlo (luego no pide los permisos para acceder a la galeria como hace Android)
    function ios_txek (){
      
      cordova.plugins.diagnostic.isMicrophoneAuthorized (function (status){
        
        if (status == 'authorized')
          d.resolve ('ok');
        else{
          
          cordova.plugins.diagnostic.requestMicrophoneAuthorization (function (status){
            
            if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED)
              d.resolve ('ok');
            else{
              $cordovaDialogs.alert ('Audioak grabatzeko, Kontaklik aplikazioa mikrofonoa erabiltzeko aukera edukitzea ezinbestekoa da.', 'Oharra', 'Ados').then (function (){
                
                d.reject ('nok');
                
              });
            }
              
          }, function (error){
            d.reject (error);
          });
          
        }
        
      }, function (error){
        d.reject (error);
      });
      
    } // ios_txek
    
    return d.promise;
    
  };
  
  
  
  return Baimenak;

}]);