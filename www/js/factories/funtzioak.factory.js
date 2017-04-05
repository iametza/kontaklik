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

        // Direktorioaren fitxategiak hartu bakarrik
        var fitxategiak = [];
        angular.forEach (entries, function (entry){
          if (entry.isFile)
            fitxategiak.push (entry);
        });

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
  /**
   *
   * Botoia zanpatzerakoan egin beharreko efektua
   * @params element Object irudiaren erreferentzia
   * @params image1 String irudia zanpatu gabe
   * @params image2 String irudia zanpatua
   *
   */
  Funtzioak.botoia_animatu = function(element, image1, image2) {
    console.log('botoia_animatu', image2, element);
    element.attr('src', image2);
    $timeout( function() {
      console.log('botoia_animatu 2', image1, element);
      element.attr('src', image1);
    }, 200);
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
