app.directive ('testua', ['$cordovaDialogs', 'Database', 'Funtzioak', '$uibModal', function ($cordovaDialogs, Database, Funtzioak, $uibModal){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<div hm-panstart="onPanStart" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" hm-rotatestart="onRotateStart" hm-rotate="onRotate" hm-rotateend="onRotateEnd" ng-dblclick="onDblClick()"></div>',
    link: function (scope, element, attrs){
      var initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          abiapuntua = {'x': 0, 'y': 0},
          limits = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
          eszenatokia = angular.element ('#eszenatokia');
          
      limits.left = eszenatokia[0].offsetLeft + 15;
      limits.top = eszenatokia[0].offsetTop + 15;
      limits.right = eszenatokia[0].offsetWidth - 15;
      limits.bottom = eszenatokia[0].offsetHeight - 15;
          
      testua_eguneratu (element.attr ('data-testua-id'));
      
      if (attrs.scale === undefined)
        element.children ().css ({ transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
        
      function testua_eguneratu (testua_id){
        
        // Recogemos los datos del texto
        Database.query ('SELECT testua, fontSize, color, borderColor, backgroundColor, class FROM eszena_testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){
          
          if (testua.length === 1){
            
            // Le damos "id" al elemento para poder hacer una txapuzilla luego
            element.children ().attr ('id', 'testua_' + testua_id);
            
            // Cargamos el texto del elemento
            element.children ().html (Funtzioak.nl2br (testua[0].testua.split (" ").splice (0, 50).join (" ")));
            
            // Cargamos el estilo del elemento
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
            
            
          }
          
        }, function (error){
          console.log ("Testua directive testua_eguneratu, SELECT", error);
        });
        
      }
      
      var updateElementTransform = function (transform_new, dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;
        
        element.children ().css (transform2css (transform_new));
        
        var bounds = document.getElementById ("testua_" + element.attr ('data-testua-id')).getBoundingClientRect ();
        if (bounds.top < limits.top || bounds.bottom > limits.bottom || bounds.right > limits.right || bounds.left < limits.left){
          element.children ().css (transform2css (transform));
          
          return (false);
        }
        else{
          transform = transform_new;
          
          if (dbGorde){
            var id = parseInt (element.attr ('data-testua-id'));
            var style = JSON.stringify (element[0].children[0].style);
        
            Database.query ('UPDATE eszena_testuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
              console.log ("Testua directive UPDATE eszena_testuak", error);
            });
          }
          
          return (true);
        }
      };
      
      var transform2css = function (t){
        var value = 'translate3d(' + t.translate.x + 'px, ' + t.translate.y + 'px, 0) ' +
                    'scale(' + t.scale + ', ' + t.scale + ') ' +
                    'rotate('+  t.angle + 'deg)';
                    
        return ({ 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value });
      };
      
      scope.onPress = function (){
        
        if (element.attr ('data-testua-id') !== undefined){
          
          Database.query ('SELECT fk_eszena FROM eszena_testuak WHERE id=?', [parseInt (element.attr ('data-testua-id'))]).then (function (testua){
            
            if (testua.length === 1){
        
              var modala = $uibModal.open ({
                animation: true,
                templateUrl: 'views/modals/eszena_testua.html',
                controller: 'ModalEszenaTestuaCtrl',
                resolve: {
                  eszena_id: function (){
                    return testua[0].fk_eszena;
                  },
                  testua_id: function (){
                    return element.attr ('data-testua-id');
                  }
                }
              });
              
              modala.result.then (function (emaitza){
                
                if (emaitza === 'ezabatu'){
                  element.remove();
                }
                else if (emaitza !== 'undefined'){
                  testua_eguneratu (emaitza);
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
          
          var t = {  translate :{ x: transform.translate.x, y: transform.translate.y   }, scale: transform.scale, angle: transform.angle, rx: 0, ry: 0, rz: 0 };
          
          t.angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);
          
          updateElementTransform (t);
          
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