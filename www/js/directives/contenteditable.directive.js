app.directive("contenteditable",['$http', function($http) {
  return {
    require: "ngModel",

    link: function(scope, element, attrs, ngModel) {

      function read() {
        //ngModel.$setViewValue(element.html());
        $http.get('https://ika-deklinabidea.iametza.com/API/v1/gomendioak?hitza=' + element.html()).then(function(res) {
          console.log('erantzuna', res);
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
