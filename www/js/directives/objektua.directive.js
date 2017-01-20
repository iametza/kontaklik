app.directive ('objektua', ['$cordovaDialogs', 'Database', function ($cordovaDialogs, Database){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<img class="laukia" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" hm-pinch="onPinch" hm-pinchend="onPinchEnd" hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" ng-dblclick="onDblClick()">',
    link: function (scope, element, attrs){
      
      var initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          abiapuntua = {'x': 0, 'y': 0},
          limits = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
          eszenatokia = angular.element ('#eszenatokia'),
          loki = attrs.lock == 'true'; // no se recibe como boolean....
          
      limits.left = eszenatokia[0].offsetLeft + 15;
      limits.top = eszenatokia[0].offsetTop + 15;
      limits.right = eszenatokia[0].offsetWidth - 15;
      limits.bottom = eszenatokia[0].offsetHeight - 15;
      
      element.children ().attr ('src', attrs.src);
      
      // Le damos "id" al elemento para poder hacer una txapuzilla luego
      element.children ().attr ('id', 'objektua_' + element.attr ('data-eo-id'));
      
      if (attrs.scale === undefined)
        element.children ().css ({ transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
      
      var updateElementTransform = function (transform_new, dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;
        
        if (!loki){
          
          // Aplicamos los cambios en el CSS
          element.children ().css (transform2css (transform_new));
          
          // Pase lo que pase, vayas donde vayas, hagas lo que hagas, ponte bragas
          // Comprobamos que tras los cambios el objeto no se salga de los limites
          var bounds = document.getElementById ("objektua_" + element.attr ('data-eo-id')).getBoundingClientRect ();
          if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.right > limits.right || bounds.left < limits.left){
            // Sale de los limites -> restablecemos los valores (nos quedamos como estabamos)
            element.children ().css (transform2css (transform));
            
            return (false);
          }
          else{
            // No se sale de los limites -> guardamos los valores nuevos y palante
            transform = transform_new;
          
            if (dbGorde){
              var id = parseInt (element.attr ('data-eo-id'));
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
      
      scope.onPress = function (){
        
        if (!loki){
          
          $cordovaDialogs.confirm ('Ezabatu nahi duzu?', 'EZABATU', ['BAI', 'EZ']).then (function (buttonIndex){
          
            if (buttonIndex == 1){
              
              if (element.attr ('data-eo-id') !== undefined){
                
                Database.query ('DELETE FROM eszena_objektuak WHERE id=?', [parseInt (element.attr ('data-eo-id'))]).then (function (){
                  
                  element.remove();
                  
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
          
          var t = {  translate :{ x: transform.translate.x, y: transform.translate.y   }, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
          
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
          
          var t = {  translate :{ x: transform.translate.x, y: transform.translate.y   }, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
          
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
          
          var t = {  translate :{ x: transform.translate.x, y: transform.translate.y   }, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
          
          t.translate.x = parseInt (abiapuntua.x) + parseInt (event.deltaX);
          t.translate.y = parseInt (abiapuntua.y) + parseInt (event.deltaY);
          
          updateElementTransform (t);
          
        }
        
      };
      
      scope.onPanEnd = function (){
        
        updateElementTransform (transform, true);
        
      };
      
      scope.onDblClick = function (){
        
        var t = {  translate :{ x: transform.translate.x, y: transform.translate.y   }, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
        
        t.angle = 0;
        t.scale = 1;
        
        if (updateElementTransform (t, true)){
          
          initAngle = 0;
          initScale = 1;
          
        }
        
      };
      
    } // link
    
  }; // return
  
}]);