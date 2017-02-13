app.directive ('objektua', ['$cordovaDialogs', '$timeout', 'Database', function ($cordovaDialogs, $timeout, Database){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<img class="laukia" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" hm-pinch="onPinch" hm-pinchend="onPinchEnd" hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" ng-dblclick="onDblClick()">',
    link: function (scope, element, attrs){
      
      var objektua_id = attrs.objektuaId !== undefined ? attrs.objektuaId : 0,
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
      element.children ().attr ('id', 'objektua_' + objektua_id);
      
      limits.left = eszenatokia[0].offsetLeft + 15;
      limits.top = eszenatokia[0].offsetTop + 15;
      limits.right = eszenatokia[0].offsetWidth - 15;
      limits.bottom = eszenatokia[0].offsetHeight - 15;
      
      // Parece ser que con hacer "$timeout a 0ms." se asegura que el elemento está cargado en el DOM.... (necesario para obtener el tamaño)
      $timeout (function (){
        
        // Si el objeto no tiene posición (recien creado) tratamos de ponerlo en el centro de la pantalla
        if (posizioa.x < 0)
          transform.translate = erdian_kokatu ();
        
        if (attrs.scale === undefined)
          element.children ().css ({ transform: 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)'});
        
      });
      
      var updateElementTransform = function (transform_new, dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;
        
        if (!loki){
          
          // Aplicamos los cambios en el CSS
          element.children ().css (transform2css (transform_new));
          
          // Pase lo que pase, vayas donde vayas, hagas lo que hagas, ponte bragas
          // Comprobamos que tras aplicar los cambios el objeto no trasvase los limites
          var bounds = document.getElementById ("objektua_" + objektua_id).getBoundingClientRect ();
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
              var id = parseInt (objektua_id);
              var style = JSON.stringify (element[0].children[0].style);
          
              Database.query ('UPDATE eszena_objektuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
                console.log ("Objektua directive UPDATE eszena_objektuak", error);
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
        
        if (!loki){
          
          $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
          
            if (buttonIndex == 1){
              
              if (objektua_id > 0){
                
                Database.query ('DELETE FROM eszena_objektuak WHERE id=?', [parseInt (objektua_id)]).then (function (){
                  
                  element.fadeOut (1000, function (){ element.remove (); });
                  
                }, function (error){
                  console.log ("Objektua directive DELETE", error);
                });
                
              }
              
            }
            
          }, function (error){
            console.log ("Objektua directive onPress", error);
          });
          
        }
        
      };
      
      scope.onRotateStart = function (event){
        
        rotationInit = event.rotation;
        
      };
      
      scope.onRotate = function (event){
        
        if (event.target === element[0].children[0]){
          
          var t = { translate: {'x': transform.translate.x, 'y': transform.translate.y}, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
          
          t.angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);
          
          updateElementTransform (t);
          
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
        
        if (updateElementTransform (transform, true))
          initScale = transform.scale;
        
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