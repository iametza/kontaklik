app.directive ('testua', ['$cordovaDialogs', '$timeout', '$uibModal', '$q', 'Database', function ($cordovaDialogs, $timeout, $uibModal, $q, Database){

  return {
    restrict: 'AE',
    scope: {},
    template : '<img class="laukia" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" hm-pinch="onPinch" hm-pinchend="onPinchEnd" hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" ng-dblclick="onDblClick()" alt="objektua" fallback-src="images/erabiltzailea.png" />'
     + '<p class="bokadilo-testua" hm-press="onPress"></p>',
    link: function (scope, element, attrs){

      var testua_id = attrs.testuaId !== undefined ? attrs.testuaId : 0,
          initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          posizioa = {'x': attrs.x !== undefined ? attrs.x : -1, 'y': attrs.y !== undefined ? attrs.y : -1},
          transform = { translate: {'x': posizioa.x, 'y': posizioa.y}, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          abiapuntua = {'x': 0, 'y': 0},
          limits = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
          eszenatokia = angular.element ('#eszenatokia'),
          loki = attrs.lock == 'true'; // no se recibe como boolean....

      element.children ().attr ('src', attrs.src);

      // Le damos "id" al elemento para poder hacer una txapuzilla luego
      element.children ().attr ('id', 'testua_' + testua_id);
      Database.query ('SELECT testua FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){

        if (testua.length === 1) {
            element.find('p').html(testua[0]['testua'].replace('<span class="gorringo">', '').replace('</span>', ''));
        }
      }, function(err) { console.log(err); });
      // Parece ser que con hacer "$timeout a 0ms." se asegura que el elemento está cargado en el DOM.... (necesario para obtener el tamaño)
      // Not true. Con 0ms. no estan cargadas las propiedades del elemento. Con 100ms. si, en las pruebas que he hecho al menos, enough?
      $timeout (function (){

        // Si el objeto no tiene posición (recien creado) tratamos de ponerlo en el centro de la pantalla
        if (posizioa.x < 0) {
          transform.translate = erdian_kokatu ();
        }

        if (attrs.scale === undefined) {
          element.children ().css ({ transform: 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'});
        }

        calculateLimits();

      }, 100);

      var updateElementTransform = function (transform_new, dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;

        if (!loki) {

          // Aplicamos los cambios en el CSS
          element.children ().css (transform2css (transform_new));

          // Pase lo que pase, vayas donde vayas, hagas lo que hagas, ponte bragas
          // Comprobamos que tras aplicar los cambios el objeto no trasvase los limites
          var bounds = document.getElementById ("testua_" + testua_id).getBoundingClientRect ();
          if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.left < limits.left || bounds.right > limits.right){
            // Trasvasa los limites -> no aceptamos pulpo como animal de compañia
            // Mejora: permitimos el movimiento en un eje que no sea trasvasado
            if (bounds.top >= limits.top && bounds.bottom <= limits.bottom){
              transform.translate.y = transform_new.translate.y;
            }
            else if (bounds.left >= limits.left && bounds.right <= limits.right){
              traelement.find('p').html(testua[0]['testua'].replace('<span class="gorringo">', '').replace('</span>', ''));
            element.children ().css (transform2css (transform));
            }
            // Aunque se mueva en un eje seguimos devolviendo false porque ha trasvasado algún limite
            // Además hay que tener en cuenta que esta función también se usa para rotar, agrandar...
            return (false);
          }
          else{
            // No trasvasa los limites -> guardamos los valores nuevos y palante
            transform = transform_new;

            if (dbGorde){
              var id = parseInt (testua_id);
              //var style = JSON.stringify (element[0].children[0].style);
              // Optimización (thaks to iOS): Sólo guardamos lo que nos haga falta
              var style = JSON.stringify ({'transform': element[0].children[0].style.transform});

              Database.query ('UPDATE eszena_testuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
                console.log ("Objektua directive UPDATE eszena_testuak", error);
              });
            }

            calculateLimits ();

            return (true);
          }

        }
      };

      var calculateLimits = function (){
        //var outMargin = Math.min(element[0].children[0].clientWidth/2, element[0].children[0].clientHeight/2);
        //var outMargin = Math.min(element[0].children[0].naturalWidth/2, element[0].children[0].naturalHeight/2);
        var bounds = document.getElementById ("testua_" + testua_id).getBoundingClientRect ();
        var outMargin = Math.min (Math.floor (bounds.width/2), Math.floor (bounds.height/2));

        limits.left = eszenatokia[0].offsetLeft - outMargin;
        limits.top = eszenatokia[0].offsetTop - outMargin;
        limits.right = eszenatokia[0].offsetWidth + outMargin;
        limits.bottom = eszenatokia[0].offsetHeight + outMargin;
      };

      var transform2css = function (t){
        var value = 'translate3d(' + t.translate.x + 'px, ' + t.translate.y + 'px, 0) ' +
                    'scale(' + t.scale + ', ' + t.scale + ') ' +
                    'rotate('+  t.angle + 'deg)';

        return ({ 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value });
      };

      var erdian_kokatu = function (){
        var p = {'x': 200, 'y': 200}; // random position chosen by Mr. Julen

        if (element[0].children[0].clientWidth > 0 && element[0].children[0].clientHeight > 0){
          p.x = Math.round (eszenatokia[0].offsetWidth / 2) - Math.round (element[0].children[0].clientWidth / 2);
          p.y = Math.round (eszenatokia[0].offsetHeight / 2) - Math.round (element[0].children[0].clientHeight / 2);
        }

        return (p);
      };

      var testua_eguneratu = function(testua_id){
        var d = $q.defer ();

        // Recogemos los datos del texto
        Database.query ('SELECT testua, fontSize, color, borderColor, backgroundColor, class FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){

          if (testua.length === 1){

            // Le damos "id" al elemento para poder hacer una txapuzilla luego
            element.children ().attr ('id', 'testua_' + testua_id);

            // Cargamos el texto del elemento
            element.find('p').html(testua[0]['testua'].replace('<span class="gorringo">', '').replace('</span>', ''));


         }

          d.resolve ();

        }, function (error){
          d.reject (error);
          console.log ("Testua directive testua_eguneratu, SELECT", error);
        });

        return d.promise;

      };
      scope.onPress = function (){
        if (!loki && testua_id > 0){

          Database.query ('SELECT fk_eszena FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){

            if (testua.length === 1) {
              var modala = $uibModal.open ({
                animation: true,
                //backdrop: 'static',
                templateUrl: 'views/modals/eszena_testua.html',
                controller: 'ModalEszenaTestuaCtrl',
                resolve: {
                  eszena_id: function (){
                    return testua[0].fk_eszena;
                  },
                  testua_id: function (){
                    return testua_id;
                  }
                }
              });

              modala.rendered.then (function (){
                scope.$parent.soinuak.audio_play ('popup');
              });

              modala.result.then (function (emaitza){

                if (emaitza === 'ezabatu'){
                  element.fadeOut (500, function (){ element.remove (); });
                }
                else if (emaitza !== 'undefined'){

                  testua_eguneratu (emaitza).then (function (){

                  }, function (error){
                      console.log ("Objektua directive SELECT", error);
                  });
                }

              });
            }
          }, function (error){
            console.log ("Objektua directive SELECT", error);
          });

        }
      };

      scope.onRotateStart = function (event){

        rotationInit = event.rotation;

      };

      scope.onRotate = function (event){

        if (event.target === element[0].children[0]){

          var new_angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);

          // en iOS se va la pinza si sueltas un dedo antes... De ahi las condiciones del ángulo
          var diff_angle = new_angle - transform.angle;
          if (diff_angle < 120 && diff_angle > -120){

            var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: new_angle, rx: 0, ry: 0, rz: 0 };

            updateElementTransform (t);

          }

        }

      };

      scope.onRotateEnd = function (){

        if (updateElementTransform (transform, true))
          initAngle = transform.angle;

      };

      scope.onPinch = function (event){

        if (event.target === element[0].children[0]){

          var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

          t.scale = parseFloat (initScale) * parseFloat (event.scale);

          updateElementTransform (t);

        }

      };

      scope.onPinchEnd = function (){

        if (updateElementTransform (transform, true)) {
          initScale = transform.scale;
        }

      };

      scope.onPanStart = function (){

        abiapuntua.x = transform.translate.x;
        abiapuntua.y = transform.translate.y;

      };

      scope.onPan = function (event){

        if (event.target === element[0].children[0]){

          var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

          t.translate.x = parseInt (abiapuntua.x) + parseInt (event.deltaX);
          t.translate.y = parseInt (abiapuntua.y) + parseInt (event.deltaY);

          updateElementTransform (t);

        }

      };

      scope.onPanEnd = function (){

        updateElementTransform (transform, true);

      };

      scope.onDblClick = function (){

        var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

        t.angle = 0;
        t.scale = 1;

        if (updateElementTransform (t, true)){

          initAngle = 0;
          initScale = 1;

        }

      };

      scope.$on ("bideo_modua_off", function (){

        loki = false;

      });

    } // link

  } // return
}]);
/*app.directive ('testua', ['$cordovaDialogs', '$timeout', '$q', 'Database', 'Funtzioak', '$uibModal', function ($cordovaDialogs, $timeout, $q, Database, Funtzioak, $uibModal){

  return {
    restrict: 'AE',
    scope: {},
    template : '<img hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" ng-dblclick="onDblClick()" />',
    link: function (scope, element, attrs){

      var testua_id = attrs.testuaId !== undefined ? attrs.testuaId : 0,
          initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          posizioa = {'x': attrs.x !== undefined ? attrs.x : -1, 'y': attrs.y !== undefined ? attrs.y : -1},
          transform = { translate: {'x': posizioa.x, 'y': posizioa.y}, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          abiapuntua = {'x': 0, 'y': 0},
          limits = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
          eszenatokia = angular.element ('#eszenatokia'),
          loki = attrs.lock == 'true'; // no se recibe como boolean....

      element.children ().attr ('src', attrs.src);

      limits.left = eszenatokia[0].offsetLeft + 15;
      limits.top = eszenatokia[0].offsetTop + 15;
      limits.right = eszenatokia[0].offsetWidth - 15;
      limits.bottom = eszenatokia[0].offsetHeight - 15;

      testua_eguneratu (testua_id).then (function (){

        // Si el objeto no tiene posición (recien creado) tratamos de ponerlo en el centro de la pantalla
        if (posizioa.x < 0)
          transform.translate = erdian_kokatu ();

        if (attrs.scale === undefined)
          element.children ().css ({ transform: 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'});

      }, function (error){
        console.log ("Testua directive, testuaren ezaugarriak kargatzen", error);
      });

      function testua_eguneratu (testua_id){
        var d = $q.defer ();

        // Recogemos los datos del texto
        Database.query ('SELECT testua, fontSize, color, borderColor, backgroundColor, class FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){

          if (testua.length === 1){

            // Le damos "id" al elemento para poder hacer una txapuzilla luego
            element.children ().attr ('id', 'testua_' + testua_id);

            // Cargamos el texto del elemento
            //element.children ().html (Funtzioak.nl2br (testua[0].testua.split (" ").splice (0, 50).join (" ")));

            // Cargamos el estilo del elemento
            /*
            element[0].children[0].style.fontSize = testua[0].fontSize + "px";
            element[0].children[0].style.color = testua[0].color;
            element[0].children[0].style.borderColor = testua[0].borderColor;
            element[0].children[0].style.backgroundColor = testua[0].backgroundColor;
            element.children ().attr ('class', testua[0].class);

            // Txapuzilla para cambiar el piquillo del bocadillo....
            var klassak = testua[0].class.split (" ");
            if (klassak.indexOf ("top") >= 0 || klassak.indexOf ("bottom") >= 0){
              angular.element ("head").append ("<style>#testua_" + testua_id + ":after { border-color: " + testua[0].borderColor + " transparent; }</style>");
            }
            else if (klassak.indexOf ("left") >= 0 || klassak.indexOf ("right") >= 0){
              angular.element ("head").append ("<style>#testua_" + testua_id + ":after { border-color: transparent " + testua[0].borderColor + "; }</style>");
            }
            */
    /*      }

          d.resolve ();

        }, function (error){
          d.reject (error);
          console.log ("Testua directive testua_eguneratu, SELECT", error);
        });

        return d.promise;

      }

      var updateElementTransform = function (transform_new, dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;

        if (!loki){

          element.children ().css (transform2css (transform_new));

          // Pase lo que pase, vayas donde vayas, hagas lo que hagas, ponte bragas
          // Comprobamos que tras aplicar los cambios el objeto no trasvase los limites
          var bounds = document.getElementById ("testua_" + testua_id).getBoundingClientRect ();
          if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.left < limits.left || bounds.right > limits.right){
            // Trasvasa los limites -> no aceptamos pulpo como animal de compañia
            // Mejora: permitimos el movimiento en un eje que no sea trasvasado
            if (bounds.top >= limits.top && bounds.bottom <= limits.bottom){
              transform.translate.y = transform_new.translate.y;
            }
            else if (bounds.left >= limits.left && bounds.right <= limits.right){
              transform.translate.x = transform_new.translate.x;
            }

            element.children ().css (transform2css (transform));

            // Aunque se mueva en un eje seguimos devolviendo false porque ha trasvasado algún limite
            // Además hay que tener en cuenta que esta función también se usa para rotar, agrandar...
            return (false);
          }
          else{
            // No trasvasa los limites -> guardamos los valores nuevos y palante
            transform = transform_new;

            if (dbGorde){
              var id = parseInt (testua_id);
              //var style = JSON.stringify (element[0].children[0].style);
              // Optimización (thaks to iOS): Sólo guardamos lo que nos haga falta
              var style = JSON.stringify ({'transform': element[0].children[0].style.transform});

              Database.query ('UPDATE eszena_testuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
                console.log ("Testua directive UPDATE eszena_testuak", error);
              });
            }

            return (true);
          }

        }

      };

      var transform2css = function (t){
        var value = 'translate3d(' + t.translate.x + 'px, ' + t.translate.y + 'px, 0) ' +
                    'scale(' + t.scale + ', ' + t.scale + ') ' +
                    'rotate('+  t.angle + 'deg)';

        return ({ 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value });
      };

      var erdian_kokatu = function (){
        var p = {'x': 200, 'y': 200}; // random position chosen by Mr. Julem

        if (element[0].children[0].clientWidth > 0 && element[0].children[0].clientHeight > 0){
          p.x = Math.round (eszenatokia[0].offsetWidth / 2) - Math.round (element[0].children[0].clientWidth / 2);
          p.y = Math.round (eszenatokia[0].offsetHeight / 2) - Math.round (element[0].children[0].clientHeight / 2);
        }

        return (p);
      };

      scope.onPress = function (){

        if (!loki && testua_id > 0){

          Database.query ('SELECT fk_eszena FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){

            if (testua.length === 1){

              var modala = $uibModal.open ({
                animation: true,
                //backdrop: 'static',
                templateUrl: 'views/modals/eszena_testua.html',
                controller: 'ModalEszenaTestuaCtrl',
                resolve: {
                  eszena_id: function (){
                    return testua[0].fk_eszena;
                  },
                  testua_id: function (){
                    return testua_id;
                  }
                }
              });

              modala.rendered.then (function (){
                scope.$parent.soinuak.audio_play ('popup');
              });

              modala.result.then (function (emaitza){

                if (emaitza === 'ezabatu'){
                  element.fadeOut (500, function (){ element.remove (); });
                }
                else if (emaitza !== 'undefined'){

                  testua_eguneratu (emaitza).then (function (){

                    // Ojete! Al modificar el texto puede que se salga del marco....
                    var bounds = document.getElementById ("testua_" + testua_id).getBoundingClientRect ();
                    if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.left < limits.left || bounds.right > limits.right){
                      // Es un salido -> Lo centramos
                      var t = { translate: erdian_kokatu (), scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

                      updateElementTransform (t, true);
                    }

                  }, function (error){
                    console.log ("Testua directive onPress, testuaren ezaugarriak kargatzen", error);
                  });

                }

              }, function (error){
                console.log ("Testua directive onPress, modala", error);
              });

            }

          }, function (error){
            console.log ("Testua directive onPress, select testua", error);
          });

        }

      };

      scope.onRotateStart = function (event){

        rotationInit = event.rotation;

      };

      scope.onRotate = function (event){

        if (event.target === element[0].children[0]){

          var new_angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);

          // en iOS se va la pinza si sueltas un dedo antes... De ahi las condiciones del ángulo
          var diff_angle = new_angle - transform.angle;
          if (diff_angle < 120 && diff_angle > -120){

            var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: new_angle, rx: 0, ry: 0, rz: 0 };

            updateElementTransform (t);

          }

        }

      };

      scope.onRotateEnd = function (){

        if (updateElementTransform (transform, true))
          initAngle = transform.angle;

      };

      scope.onPanStart = function (){

        abiapuntua.x = transform.translate.x;
        abiapuntua.y = transform.translate.y;

      };

      scope.onPan = function (event){

        if (event.target === element[0].children[0]){

          var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

          t.translate.x = parseInt (abiapuntua.x) + parseInt (event.deltaX);
          t.translate.y = parseInt (abiapuntua.y) + parseInt (event.deltaY);

          updateElementTransform (t);

        }

      };

      scope.onPanEnd = function (){

        updateElementTransform (transform, true);

      };

      scope.onDblClick = function (){

        var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };

        t.angle = 0;
        t.scale = 1;

        if (updateElementTransform (t, true)){

          initAngle = 0;
          initScale = 1;

        }

      };

      scope.$on ("bideo_modua_off", function (){

        loki = false;

      });

    } // link

  }; // return

}]);
*/
