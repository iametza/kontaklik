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
          offset = {'x': 0, 'y': 0}, minBound = {'x': 0, 'y': 0}, maxBound = {'x': 0, 'y': 0},
          eszenatokia = angular.element ('#eszenatokia');
          
      minBound.x = eszenatokia[0].offsetLeft + 10;
      minBound.y = eszenatokia[0].offsetTop + 10;
      maxBound.x = eszenatokia[0].offsetWidth - 10;
      maxBound.y = eszenatokia[0].offsetHeight - 10;
          
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
            element.children ().html (Funtzioak.nl2br (testua[0].testua));
            
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
      
      var updateElementTransform = function (dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;
        
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) ' +
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)';
                    
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };
        
        element.children ().css (css);
        
        if (dbGorde){
          var id = parseInt (element.attr ('data-testua-id'));
          var style = JSON.stringify (element[0].children[0].style);
      
          Database.query ('UPDATE eszena_testuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
            console.log ("Testua directive UPDATE eszena_testuak", error);
          });
        }
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
          transform.angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);
          transform.rz = 1;
          updateElementTransform ();
        }
        
      };
      
      scope.onRotateEnd = function (){
        
        initAngle = transform.angle;
        updateElementTransform (true);
        
      };
      
      scope.onPanStart = function (event){
        
        /*maxBound.x = (minBound.x + eszenatokia[0].offsetWidth - element[0].children[0].offsetWidth) - 30; // teorian 30px hoiek ez ziren kendu behar
        maxBound.y = (minBound.y + eszenatokia[0].offsetHeight - element[0].children[0].offsetHeight) - 30; // teorian 30px hoiek ez ziren kendu behar*/
        
        offset.x = event.srcEvent.offsetX;
        offset.y = event.srcEvent.offsetY;
        
      };
      
      scope.onPan = function (event){
        
        if (event.target === element[0].children[0]){
          var bounds = document.getElementById ("testua_" + element.attr ('data-testua-id')).getBoundingClientRect ();
          var newX = event.center.x - offset.x;
          var newY = event.center.y - offset.y;
          
          if ((bounds.top > minBound.y || newY > transform.translate.y) &&
              (bounds.bottom < maxBound.y || newY < transform.translate.y) &&
              (bounds.right < maxBound.x || newX < transform.translate.x) &&
              (bounds.left > minBound.x || newX > transform.translate.x)){
            transform.translate.x = newX;
            transform.translate.y = newY;
            /*transform.translate.x = Math.max (minBound.x, Math.min (event.center.x - offset.x, maxBound.x));
            transform.translate.y = Math.max (minBound.y, Math.min (event.center.y - offset.y, maxBound.y));*/
            
            updateElementTransform ();
          }
          
        }
        
      };
      
      scope.onPanEnd = function (){
        
        updateElementTransform (true);
        
      };
      
      scope.onDblClick = function (){
        
        initAngle = transform.angle = 0;
        initScale = transform.scale = transform.rz = 1;
        updateElementTransform (true);
        
      };
      
    } // link
    
  }; // return
  
}]);