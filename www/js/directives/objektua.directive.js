app.directive ('objektua', ['$cordovaDialogs', 'Database', function ($cordovaDialogs, Database){
  
  return {
    restrict: 'AE',
    scope: {},
    template : '<img class="laukia" hm-rotate="onRotate($event)" hm-rotateend="onRotateEnd()" hm-rotatestart="onRotateStart($event)" hm-pinchend="onPinchEnd()" hm-pinch="onPinch($event)" hm-panmove="onPan($event)" hm-press="onPress($event)">',
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
      
      var updateElementTransform = function (){
        var value = 'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0) ' +
                    'scale(' + transform.scale + ', ' + transform.scale + ') ' +
                    'rotate('+  transform.angle + 'deg)';
        var css = { 'transform': value, '-webkit-transform': value, '-moz-transform': value, '-o-transform': value };
        
        element.children ().css (css);
      };
      
      scope.onPress = function onPress (){
        
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
      
      scope.onPinchEnd = function onPinchEnd (){
        
        initScale = transform.scale;
        
      };
      
      scope.onPinch = function onPinch (event){
        
        if (event.target === element[0].children[0]){
          transform.scale = initScale * event.scale;
          updateElementTransform();
        }
        
      };
      
      scope.onPan = function onPan (event){
        
        if (event.target === element[0].children[0]){
          transform.translate.x = event.center.x - elementWidth;
          transform.translate.y = event.center.y - elementHeight;
          updateElementTransform ();
        }
        
      };
      
    } // link
    
  }; // return
  
}]);