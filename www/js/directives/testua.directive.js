app.directive ('testua', ['$cordovaDialogs', 'Database', 'Funtzioak', '$uibModal', function ($cordovaDialogs, Database, Funtzioak, $uibModal){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<div hm-panmove="onPan" hm-press="onPress" hm-rotate="onRotate($event)" hm-rotateend="onRotateEnd()" hm-rotatestart="onRotateStart($event)" ng-dblclick="onDblClick()"></div>',
    link: function (scope, element, attrs){
      var initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          elementWidth = 75,
          elementHeight = 75;
      
      /*if (attrs.edukia !== undefined)
        element.children ().html (Funtzioak.nl2br (attrs.edukia));*/
      testua_eguneratu (element.attr ('data-testua-id'));
      
      if (attrs.scale === undefined)
        element.children ().css ({ transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
        
      function testua_eguneratu (testua_id){
        
        // Recogemos los datos del texto
        Database.query ('SELECT testua, fontSize, color, borderColor, backgroundColor, class FROM testuak WHERE id=?', [parseInt (testua_id)]).then (function (testua){
          
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
          console.log ("ModalEszenaTestuaCtrl, select testua", error);
        });
        
      }
      
      var updateElementTransform = function (){
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) ' +
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)';
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };
        
        element.children ().css (css);
      };
      
      scope.onPress = function onPress (){
        
        if (element.attr ('data-testua-id') !== undefined){
          
          Database.query ('SELECT fk_eszena FROM testuak WHERE id=?', [parseInt (element.attr ('data-testua-id'))]).then (function (testua){
            
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
      
      scope.onRotateEnd = function onRotateEnd (){
        
        initAngle = transform.angle;
        
      };
      
      scope.onRotateStart = function onRotateEnd (event){
        
        rotationInit = event.rotation;
        
      };
      
      scope.onRotate = function onRotate (event){
        
        if (event.target === element[0].children[0]){
          transform.angle = parseFloat (initAngle) + parseFloat (event.rotation - rotationInit);
          transform.rz = 1;
          updateElementTransform ();
        }
        
      };
      
      scope.onPan = function onPan (event){
        
        if (event.target === element[0].children[0]){
          transform.translate.x = event.center.x - elementWidth;
          transform.translate.y = event.center.y - elementHeight;
          updateElementTransform ();
        }
        
      };
      
      scope.onDblClick = function (){
        
        initAngle = transform.angle = 0;
        initScale = transform.scale = transform.rz = 1;
        updateElementTransform ();
        
      };
      
    } // link
    
  }; // return
  
}]);