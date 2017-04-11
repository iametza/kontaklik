app.directive("contenteditable",['$http', '$q', function($http, $q) {
  return {
    require: "ngModel",

    link: function(scope, element, attrs, ngModel) {
      var canceler = $q.defer();
      $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
      function strip(html) {
         var tmp = document.createElement("DIV");
         tmp.innerHTML = html;
         return tmp.textContent || tmp.innerText || "";
      }
      function placeCaretAtEnd(el) {
          //el.focus();
          if (window.getSelection){
              if (typeof window.getSelection != "undefined"
                      && typeof document.createRange != "undefined") {
                  var range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  var sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
              } else if (typeof document.body.createTextRange != "undefined") {
                  var textRange = document.body.createTextRange();
                  textRange.moveToElementText(el);
                  textRange.collapse(false);
                  textRange.select();
              }
          }
      }
      function read() {
        canceler.resolve("cancelled");
        canceler = $q.defer();
        var textarea = strip(element.html());
        
        console.log(textarea);
        $http({
          method: 'GET',
          url:'https://deklinabidea.ikaeuskaltegiak.eus/API/v1/zuzentzailea',
          params:{
            hitzak: textarea
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          timeout: canceler.promise
        }).then(function(res) {

          var testuak = textarea.split(' ');

          var zuzenketak = res.data.zuzenketak;
          if(Array.isArray(zuzenketak) && zuzenketak.length > 0) {
            for(var i=0; i < zuzenketak.length; i++) {
              if(Array.isArray(zuzenketak[i]) || zuzenketak[i] == '+') {
                var testua = '<span class="gorringo">' + testuak[i] + '</span>';
                testuak[i] = testua;
              }
            }
            element.html(testuak.join(' '));
            placeCaretAtEnd(document.getElementById('testua-div'));
          }
        });
      }

      ngModel.$render = function() {
        //element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
}]);
