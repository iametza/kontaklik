app.factory('Funtzioak', ['$q', '$timeout', '$compile', 'Database', function($q, $timeout, $compile, Database) {

  var Funtzioak = {};

  Funtzioak.nl2br = function(str, is_xhtml) {

    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';

    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');

  };
  Funtzioak.dataURItoBlob = function(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1].replace(/\s/g, ''));
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
      type: mimeString
    });
  }

  Funtzioak.listDir = function(path) {
    var d = $q.defer();

    window.resolveLocalFileSystemURL(path, function(fileSystem) {

      var reader = fileSystem.createReader();

      reader.readEntries(function(entries) {

        // Direktorioaren fitxategiak hartu bakarrik
        var fitxategiak = [];
        angular.forEach(entries, function(entry) {
          if (entry.isFile)
            fitxategiak.push(entry);
        });

        d.resolve(fitxategiak);

      }, function(error) {
        d.reject(error);
      });

    }, function(error) {
      d.reject(error);
    });

    return d.promise;

  };

  Funtzioak.Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
      $timeout.cancel(timerId);
      remaining -= new Date() - start;
    };

    this.resume = function() {
      start = new Date();
      $timeout.cancel(timerId);
      timerId = $timeout(callback, remaining);
    };

    this.stop = function() {
      $timeout.cancel(timerId);
    };

    this.resume();
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
    element.attr('src', image2);
    $timeout(function() {
      element.attr('src', image1);
    }, 200);
  };
  Funtzioak.get_fullPath = function(fitxategia) {
    var fullPath = '';

    if (fitxategia.hasOwnProperty('cordova_file') &&
      fitxategia.hasOwnProperty('path') &&
      fitxategia.hasOwnProperty('izena') &&
      fitxategia.izena.trim() != '') {

      switch (fitxategia.cordova_file) {
        case 'applicationDirectory':
          fullPath = cordova.file.applicationDirectory;
          break;
        case 'dataDirectory':
        default:
          fullPath = cordova.file.dataDirectory;
          break;
      }

      if (fitxategia.path.trim() != '')
        fullPath += fitxategia.path;

      fullPath += fitxategia.izena;
    }
    return (fullPath);
  };
  Funtzioak.objektuaEszenara = function(eszena_objektua_id, show, lock, $scope) {
    show = typeof show !== 'undefined' ? show : true;
    lock = typeof lock !== 'undefined' ? lock : false;
    var d = $q.defer();

    Database.query('SELECT i.cordova_file, i.path, i.izena, eo.style FROM eszena_objektuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [eszena_objektua_id]).then(function(objektua) {

      if (objektua.length === 1) {

        if (objektua[0].izena !== null) {
          var elem = angular.element('<div objektua="objektua" class="objektua" data-objektua-id="' + eszena_objektua_id + '" data-src="' + Funtzioak.get_fullPath(objektua[0]) + '" data-lock="' + lock + '" ></div>');

          elem.hide();

          if (objektua[0].style !== null) {

            var style_object = JSON.parse(objektua[0].style);

            // Sacamos la scale y el rotate del objeto para pasársela a la directiva
            //console.log (style_object.transform);
            //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
            var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
            var patroia_scale = /^.* scale\((.*?),.*$/g;
            var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;

            if (style_object.transform.match(patroia_xy)) {
              elem.attr('data-x', style_object.transform.replace(patroia_xy, "$1"));
              elem.attr('data-y', style_object.transform.replace(patroia_xy, "$2"));
            }

            if (style_object.transform.match(patroia_scale))
              elem.attr('data-scale', style_object.transform.replace(patroia_scale, "$1"));

            if (style_object.transform.match(patroia_rotate))
              elem.attr('data-rotate', style_object.transform.replace(patroia_rotate, "$1"));

            // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
            el = $compile(elem)($scope);

            //elem.children ().css (style_object);
            // Optimización (thaks to iOS): Sólo cargamos lo que nos haga falta
            elem.children().css('transform', style_object.transform);

          } else
            el = $compile(elem)($scope);

          angular.element('#eszenatokia').append(elem);
          $scope.insertHere = el;

          if (show)
            elem.fadeIn(500, function() {
              d.resolve();
            });
          else
            d.resolve();
        } else
          d.resolve();

      } else
        d.reject('IpuinaCtrl objektuaEszenara, objektua.length != 1');

    }, function(error) {
      console.log("IpuinaCtrl, objektuaEszenara", error);
      d.reject(error);
    });

    return d.promise;

  }
  return Funtzioak;

}]);
