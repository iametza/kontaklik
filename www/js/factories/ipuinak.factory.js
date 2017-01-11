app.factory('Ipuinak', ['$q', 'Database', function($q, Database){
  
  var Ipuinak = {};
  
  Ipuinak.ezabatu_eszena = function (eszena_id){
    var d = $q.defer ();
    
    // Empezamos borrando los objetos de la eszena
    Database.deleteRows ('eszena_objektuak', {'fk_eszena': eszena_id}).then (function (){
      
      // Borramos los textos de la eszena
      Database.deleteRows ('eszena_testuak', {'fk_eszena': eszena_id}).then (function (){
      
        // Borramos los datos de la eszena
        Database.deleteRows ('eszenak', {'id': eszena_id}).then (function (){
          
          d.resolve ();
          
        }, function (error){
          console.log ("Ipuinak factory, ezabatu_eszena eszena ezabatzerakoan", error);
          d.reject (error);
        });
        
      }, function (error){
        console.log ("Ipuinak factory, ezabatu_eszena eszena_testuak ezabatzerakoan", error);
        d.reject (error);
      });
      
    }, function (error){
      console.log ("Ipuinak factory, ezabatu_eszena eszena_objektuak ezabatzerakoan", error);
      d.reject (error);
    });
    
    return d.promise;
  };
  
  Ipuinak.ezabatu_ipuina = function (ipuina_id){
    var d = $q.defer ();
    var promiseak = [];
    
    // Recogemos/Borramos las eszenak del ipuina
    Database.getRows ('eszenak', {'fk_ipuina': ipuina_id}, ' ORDER BY timestamp ASC').then (function (eszenak){
      
      angular.forEach (eszenak, function (eszena){
        
        promiseak.push (Ipuinak.ezabatu_eszena (eszena.id));
    
      });
      
      $q.all (promiseak).then (function (){
      
        // Borramos los datos del ipuina
        Database.deleteRows ('ipuinak', {'id': ipuina_id}).then (function (){
          
          d.resolve ();
          
        }, function (error){
          console.log ("Ipuinak factory, ezabatu_ipuina ipuina ezabatzerakoan", error);
          d.reject (error);
        });
        
      }, function (error){
        console.log ("Ipuinak factory, ezabatu_ipuina q.all error", error);
        d.reject (error);
      });
      
    }, function (error){
      console.log ("Ipuinak factory, ezabatu_ipuina eszenak jasotzen", error);
      d.reject (error);
    });
    
    return d.promise;
  };
  
  return Ipuinak;

}]);