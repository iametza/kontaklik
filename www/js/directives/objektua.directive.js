app.directive ('objektua', ['$cordovaDialogs', 'Database', function ($cordovaDialogs, Database){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<img class="laukia" hm-rotate="onRotate" hm-rotateend="onRotateEnd" hm-rotatestart="onRotateStart" hm-pinchend="onPinchEnd" hm-pinch="onPinch" hm-panmove="onPan" hm-panend="onPanEnd" hm-press="onPress" ng-dblclick="onDblClick()">',
    link: function (scope, element, attrs){
      var initScale = attrs.scale !== undefined ? attrs.scale : 1,
          initAngle = attrs.rotate !== undefined ? attrs.rotate : 0,
          rotationInit = 0,
          transform = {  translate :{ x: attrs.x, y: attrs.y   }, scale: initScale, angle: initAngle, rx: 0, ry: 0, rz: 0 },
          elementWidth = 75,
          elementHeight = 75;
      
      element.children ().attr ('src', attrs.background);
      
      if (attrs.scale === undefined)
        element.children ().css ({ transform: 'translate3d(' + attrs.x + 'px, ' + attrs.y + 'px, 0)'});
      
      var updateElementTransform = function (dbGorde){
        dbGorde = typeof dbGorde !== 'undefined' ? dbGorde : false;
        
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) ' +
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)';
                    
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };
        
        element.children ().css (css);
        
        if (dbGorde){
          var id = parseInt (element.attr ('data-eo-id'));
          var style = JSON.stringify (element[0].children[0].style);
      
          Database.query ('UPDATE eszena_objektuak SET style=? WHERE id=?', [style, id]).then (function (){}, function (error){
            console.log ("Objektua directive UPDATE eszena_objektuak", error);
          });
        }
      };
      
      scope.onPress = function (){
        
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
      
      scope.onPinch = function (event){
        
        if (event.target === element[0].children[0]){
          transform.scale = initScale * event.scale;
          updateElementTransform();
        }
        
      };
      
      scope.onPinchEnd = function (){
        
        initScale = transform.scale;
        updateElementTransform (true);
        
      };
      
      scope.onPan = function (event){
        
        if (event.target === element[0].children[0]){
          transform.translate.x = event.center.x - elementWidth;
          transform.translate.y = event.center.y - elementHeight;
          updateElementTransform ();
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