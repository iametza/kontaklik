app.directive('objektua', ['$uibModal', '$cordovaVibration', '$timeout', 'Database', function($uibModal, $cordovaVibration, $timeout, Database) {

  return {
    restrict: 'AE',
    scope: {},
    template: '<img class="laukia" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" hm-pinch="onPinch" hm-pinchend="onPinchEnd" hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" ng-dblclick="onDblClick()" alt="objektua" fallback-src="images/erabiltzailea.png" />',
    link: function(scope, element, attrs) {

      var objektua_id = attrs.objektuaId !== undefined ? attrs.objektuaId : 0,
        initScale = attrs.scale !== undefined ? attrs.scale : 1,
        initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
        rotationInit = 0,
        posizioa = {
          'x': attrs.x !== undefined ? attrs.x : -1,
          'y': attrs.y !== undefined ? attrs.y : -1
        },
        transform = {
          translate: {
            'x': posizioa.x,
            'y': posizioa.y
          },
          scale: initScale,
          angle: initAngle,
          rx: 0,
          ry: 0,
          rz: 0
        },
        abiapuntua = {
          'x': 0,
          'y': 0
        },
        limits = {
          'top': 0,
          'right': 0,
          'bottom': 0,
          'left': 0
        },
        eszenatokia = angular.element('#eszenatokia'),
        loki = attrs.lock == 'true'; // no se recibe como boolean....
      element.children('.laukia').attr('src', attrs.src);

      // Le damos "id" al elemento para poder hacer una txapuzilla luego
      element.children('.laukia').attr('id', 'objektua_' + objektua_id);

      // Parece ser que con hacer "$timeout a 0ms." se asegura que el elemento está cargado en el DOM.... (necesario para obtener el tamaño)
      // Not true. Con 0ms. no estan cargadas las propiedades del elemento. Con 100ms. si, en las pruebas que he hecho al menos, enough?
      $timeout(function() {

        // Si el objeto no tiene posición (recien creado) tratamos de ponerlo en el centro de la pantalla
        if (posizioa.x < 0) {
          transform.translate = erdian_kokatu();
        }

        if (attrs.scale === undefined) {
          element.children('.laukia').css({
            transform: 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'
          });
        }

        calculateLimits();

      }, 100);
      var getScale = function() {
        var style = element[0].children[0].style.transform;
        var patroia_scale = /^.* scale\((.*?),.*$/g;
        var scale = style.replace(patroia_scale, "$1");

        return scale;
      };
      var updateElementTransform = function(transform_new, dbGorde) {
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;

        if (!loki) {
          // Aplicamos los cambios en el CSS
          element.children('.laukia').css(transform2css(transform_new));

          // Pase lo que pase, vayas donde vayas, hagas lo que hagas, ponte bragas
          // Comprobamos que tras aplicar los cambios el objeto no trasvase los limites
          var bounds = document.getElementById("objektua_" + objektua_id).getBoundingClientRect();
          if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.left < limits.left || bounds.right > limits.right) {
            // Trasvasa los limites -> no aceptamos pulpo como animal de compañia
            // Mejora: permitimos el movimiento en un eje que no sea trasvasado
            if (bounds.top >= limits.top && bounds.bottom <= limits.bottom) {
              transform.translate.y = transform_new.translate.y;
            } else if (bounds.left >= limits.left && bounds.right <= limits.right) {
              transform.translate.x = transform_new.translate.x;
            }
            element.children('.laukia').css(transform2css(transform));

            // Aunque se mueva en un eje seguimos devolviendo false porque ha trasvasado algún limite
            // Además hay que tener en cuenta que esta función también se usa para rotar, agrandar...
            return (false);
          } else {
            // No trasvasa los limites -> guardamos los valores nuevos y palante
            transform = transform_new;

            if (dbGorde) {
              var id = parseInt(objektua_id);
              //var style = JSON.stringify (element[0].children[0].style);
              // Optimización (thaks to iOS): Sólo guardamos lo que nos haga falta
              var style = JSON.stringify({
                'transform': element[0].children[0].style.transform
              });

              Database.query('UPDATE eszena_objektuak SET style=? WHERE id=?', [style, id]).then(function() {}, function(error) {
                console.log("Objektua directive UPDATE eszena_objektuak", error);
              });
            }

            calculateLimits();

            return (true);
          }

        }
      };

      var calculateLimits = function() {
        //var outMargin = Math.min(element[0].children[0].clientWidth/2, element[0].children[0].clientHeight/2);
        //var outMargin = Math.min(element[0].children[0].naturalWidth/2, element[0].children[0].naturalHeight/2);
        var bounds = document.getElementById("objektua_" + objektua_id).getBoundingClientRect();
        var outMargin = Math.min(Math.floor(bounds.width / 2), Math.floor(bounds.height / 2));

        limits.left = eszenatokia[0].offsetLeft - outMargin;
        limits.top = eszenatokia[0].offsetTop - outMargin;
        limits.right = eszenatokia[0].offsetWidth + outMargin;
        limits.bottom = eszenatokia[0].offsetHeight + outMargin;
      };

      var transform2css = function(t) {
        var scale = getScale();
        if((scale < 0 && t.scale > 0) || (scale > 0 && t.scale < 0)) {
          t.scale = t.scale * -1;
          //t.angle = t.angle * -1;
        }
        var value = 'translate3d(' + t.translate.x + 'px, ' + t.translate.y + 'px, 0) ' +
          'scale(' + t.scale + ', ' + Math.abs(t.scale) + ') ' +
          'rotate(' + t.angle + 'deg)';

        return ({
          'transform': value,
          '-webkit-transform': value,
          '-moz-transform': value,
          '-o-transform': value
        });
      };

      var erdian_kokatu = function() {
        var p = {
          'x': 200,
          'y': 200
        }; // random position chosen by Mr. Julen

        if (element[0].children[0].clientWidth > 0 && element[0].children[0].clientHeight > 0) {
          p.x = Math.round(eszenatokia[0].offsetWidth / 2) - Math.round(element[0].children[0].clientWidth / 2);
          p.y = Math.round(eszenatokia[0].offsetHeight / 2) - Math.round(element[0].children[0].clientHeight / 2);
        }

        return (p);
      };

      scope.onPress = function() {
        $cordovaVibration.vibrate(100);

        if (!loki) {
          var modala = $uibModal.open({
            animation: true,
            size: 'lg',
            backdrop: 'static',
            templateUrl: 'views/modals/objektu_menua.html',
            controller: 'ObjektuMenuaCtrl',
            windowClass: 'gardena',
            resolve: {
              objektua_id: function() {
                return objektua_id;
              }
            }
          });
          modala.result.then(function(result) {
            switch(result.aukera) {
              case 1: // ezabatu
                element.fadeOut(500, function() {
                  element.remove();
                });
                break;
              case 3:

                element.children('.laukia').css('transform', result.style.transform);
                break;
              case 4: // lehenengo_planora
                element.children('.laukia').css('z-index', result.zindex);
                break;
              case 2: // bikoiztu
              default:
                break;
            }
          }, function(error) {
            console.log("Objektua controller, objektu_menua modala", error);
          });
        }

      };

      scope.onRotateStart = function(event) {

        rotationInit = event.rotation;

      };

      scope.onRotate = function(event) {        
        if (event.target === element[0].children[0]) {

          var new_angle = (parseFloat(initAngle) + parseFloat(event.rotation - rotationInit)) * Math.sign(transform.scale);

          // en iOS se va la pinza si sueltas un dedo antes... De ahi las condiciones del ángulo
          var diff_angle = new_angle - transform.angle;
          if (diff_angle < 120 && diff_angle > -120) {

            var t = {
              translate: {
                'x': transform.translate.x,
                'y': transform.translate.y
              },
              scale: transform.scale,
              angle: new_angle,
              rx: 0,
              ry: 0,
              rz: 0
            };

            updateElementTransform(t);

          }

        }

      };

      scope.onRotateEnd = function() {

        if (updateElementTransform(transform, true))
          initAngle = transform.angle;

      };

      scope.onPinch = function(event) {

        if (event.target === element[0].children[0]) {

          var t = {
            translate: {
              'x': transform.translate.x,
              'y': transform.translate.y
            },
            scale: transform.scale,
            angle: transform.angle,
            rx: 0,
            ry: 0,
            rz: 0
          };

          t.scale = parseFloat(initScale) * parseFloat(event.scale);

          updateElementTransform(t);

        }

      };

      scope.onPinchEnd = function() {

        if (updateElementTransform(transform, true)) {
          initScale = transform.scale;
        }

      };

      scope.onPanStart = function() {

        abiapuntua.x = transform.translate.x;
        abiapuntua.y = transform.translate.y;

      };

      scope.onPan = function(event) {

        if (event.target === element[0].children[0]) {

          var t = {
            translate: {
              'x': transform.translate.x,
              'y': transform.translate.y
            },
            scale: transform.scale,
            angle: transform.angle,
            rx: 0,
            ry: 0,
            rz: 0
          };

          t.translate.x = parseInt(abiapuntua.x) + parseInt(event.deltaX);
          t.translate.y = parseInt(abiapuntua.y) + parseInt(event.deltaY);

          updateElementTransform(t);

        }

      };

      scope.onPanEnd = function() {

        updateElementTransform(transform, true);

      };

      scope.onDblClick = function() {

        var t = {
          translate: {
            'x': transform.translate.x,
            'y': transform.translate.y
          },
          scale: transform.scale,
          angle: transform.angle,
          rx: 0,
          ry: 0,
          rz: 0
        };

        t.angle = 0;
        t.scale = 1;

        if (updateElementTransform(t, true)) {

          initAngle = 0;
          initScale = 1;

        }

      };

      scope.$on("bideo_modua_off", function() {

        loki = false;

      });

    } // link

  }; // return

}]);
