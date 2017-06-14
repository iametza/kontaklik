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
    element.addClass('botoia-haunditu');
    element.attr('src', image2);
    //element.addClass(className);
    $timeout(function() {
      element.attr('src', image1);
      element.removeClass('botoia-haunditu');  
    }, 500);
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

    Database.query('SELECT i.cordova_file, i.path, i.izena, eo.style, eo.style1, eo.style2, eo.zindex FROM eszena_objektuak eo LEFT JOIN irudiak i ON eo.fk_objektua=i.id WHERE eo.id=?', [eszena_objektua_id]).then(function(objektua) {
      if (objektua.length === 1) {
        if (objektua[0].izena !== null) {
          var elem = angular.element('<div objektua="objektua" class="objektua" data-objektua-id="' + eszena_objektua_id + '" data-src="' + Funtzioak.get_fullPath(objektua[0]) + '" data-lock="' + lock + '" ></div>');
          elem.hide();

          if (objektua[0].style !== null) {
            var style_object;
            if(!lock) {
              style_object = JSON.parse(objektua[0].style);
            } else {
              if(objektua[0].style1 != null && objektua[0].style2 != null) {
                style_object = JSON.parse(objektua[0].style1);
              } else {
                style_object = JSON.parse(objektua[0].style);
              }
            }

            //z-index
            var x, y, scale, rotate;

            // Sacamos la scale y el rotate del objeto para pasársela a la directiva
            //console.log (style_object.transform);
            //translate3d(683px, 356px, 0px) scale(3.10071, 3.10071) rotate(-17.6443deg)
            var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
            var patroia_scale = /^.* scale\((.*?),.*$/g;
            var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;

            if (style_object.transform.match(patroia_xy)) {
              x = style_object.transform.replace(patroia_xy, "$1");
              y = style_object.transform.replace(patroia_xy, "$2");
              elem.attr('data-x', x);
              elem.attr('data-y', y);
            }

            if (style_object.transform.match(patroia_scale)) {
              scale = style_object.transform.replace(patroia_scale, "$1");
              elem.attr('data-scale', scale);
            }

            if (style_object.transform.match(patroia_rotate)) {
              rotate = style_object.transform.replace(patroia_rotate, "$1");
              elem.attr('data-rotate', rotate);
            }

            // Ojo que el orden es importante: 'el' tiene que estar después de asignar scale y antes de darle el CSS
            el = $compile(elem)($scope);

            //elem.children ().css (style_object);
            // Optimización (thaks to iOS): Sólo cargamos lo que nos haga falta
            elem.children().css('transform', style_object.transform);
          } else {
            el = $compile(elem)($scope);
          }
          elem.children().css('z-index', parseInt(objektua[0].zindex));
          angular.element('#eszenatokia').append(elem);
          $scope.insertHere = el;
          if (show) {
            elem.fadeIn(500, function() {
              d.resolve();
            });
          } else {
            if(lock == true && objektua[0].style1 != null && objektua[0].style2 != null) {
              var x2, y2, scale2, rotate2, style_object2 = JSON.parse(objektua[0].style2);
              if (style_object2.transform.match(patroia_xy)) {
                x2 = style_object2.transform.replace(patroia_xy, "$1");
                y2 = style_object2.transform.replace(patroia_xy, "$2");
              }

              if (style_object2.transform.match(patroia_scale))
                scale2 =  style_object2.transform.replace(patroia_scale, "$1");

              if (style_object.transform.match(patroia_rotate))
                 rotate2 = style_object2.transform.replace(patroia_rotate, "$1");
              console.log(x, y, scale, rotate, 'nora', x2, y2, scale2, rotate2);
              //scale2 = scale;

              elem.children()
              .velocity({
                   translateX: x + 'px',
                   translateY: y + 'px',
                   scaleX: scale,
                   scaleY: Math.abs(scale),
                   rotateZ: rotate + 'deg',
               },
               {
                  duration: 0,
                  loop: false,
                  easing: 'ease-in-out'
                })
                .velocity({
                   translateX: x2 + 'px',
                   translateY: y2 + 'px',
                   scaleX: scale2,
                   scaleY: Math.abs(scale2),
                   rotateZ: rotate2 + 'deg'
               },
               {
                  duration: 3000,
                  loop: false,
                  easing: 'ease-in-out'
                });

            }
            d.resolve();
          }
        } else {
          d.resolve();
        }
      } else
        d.reject('IpuinaCtrl objektuaEszenara, objektua.length != 1');

    }, function(error) {
      console.log("IpuinaCtrl, objektuaEszenara", error);
      d.reject(error);
    });

    return d.promise;

  };
  Funtzioak.maxZindex = function(fk_eszena) {
    var d = $q.defer();
    var zindex = 0;
    Database.query("SELECT zindex as max FROM eszena_objektuak WHERE fk_eszena = ? ORDER BY zindex DESC LIMIT 1", [fk_eszena]).then(function(res) {
      if(res.length > 0) {
        zindex = res[0].max;
      }
      Database.query("SELECT zindex as max FROM eszena_testuak WHERE fk_eszena = ? ORDER BY zindex DESC LIMIT 1", [fk_eszena]).then(function(res) {
        if(res.length > 0 && res[0].max > zindex) {
          zindex = res[0].max;
        }
        d.resolve(zindex);
      }, function(error) {
        console.log("IpuinaCtrl, getTotalObjects", error);
        d.reject(error);
      });
    }, function(error) {
      console.log("IpuinaCtrl, getTotalObjects", error);
      d.reject(error);
    });
    return d.promise;
  };
  Funtzioak.getTotalObjects = function(fk_eszena) {
    var d = $q.defer();
    var totala  = 0;
    var objektuak = [];
    Database.query("SELECT * FROM eszena_objektuak WHERE fk_eszena = ?", [fk_eszena]).then(function(res) {
      totala = res.length;
      objektuak = res;
      Database.query("SELECT * FROM eszena_testuak WHERE fk_eszena = ?", [fk_eszena]).then(function(res) {
        totala = totala + res.length;
        objektuak.push.apply(objektuak, res);
        console.log('objektuak', objektuak, totala);
        d.resolve(objektuak);
      }, function(error) {
        console.log("IpuinaCtrl, getTotalObjects", error);
        d.reject(error);
      });
    }, function(error) {
      console.log("IpuinaCtrl, getTotalObjects", error);
      d.reject(error);
    });
    return d.promise;
  };
  return Funtzioak;

}]);
