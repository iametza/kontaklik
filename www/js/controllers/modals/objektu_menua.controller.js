app.controller('ObjektuMenuaCtrl', ['$scope', '$uibModalInstance', 'Database', 'Funtzioak', 'objektua_id', function($scope, $uibModalInstance, Database, Funtzioak, objektua_id) {
  $scope.ezabatu = function() {
    if (objektua_id > 0) {
      Database.query('DELETE FROM eszena_objektuak WHERE id=?', [parseInt(objektua_id)]).then(function() {
        $uibModalInstance.close({ aukera:1, style: undefined});
      }, function(error) {
        $uibModalInstance.close({ aukera:1, style: undefined});
        console.log("Objektua directive DELETE", error);
      });
    }
  };
  $scope.lehenengo_planora = function() {
    if (objektua_id > 0) {
      Database.query('SELECT * FROM eszena_objektuak WHERE id = ?', [parseInt(objektua_id)]).then(function(res) {
        var objektua = res[0];
        Funtzioak.maxZindex(objektua.fk_eszena).then(function(res) {
          var zindex = parseInt(res) + 1;
          Database.query('UPDATE eszena_objektuak SET zindex = ? WHERE id = ?', [zindex, parseInt(objektua_id)]).then(function(res) {
            $uibModalInstance.close({ aukera:4, style: undefined, zindex: zindex});
          }, function(error) {
            $uibModalInstance.close({ aukera:4, style: undefined, zindex: zindex});
            console.log("Objektua directive buelta eman", error);
          });
        }, function(error) {
          $uibModalInstance.close({ aukera:4, style: undefined});
          console.log("Objektua directive buelta eman", error);
        });
      }, function(error) {
        $uibModalInstance.close({ aukera:4, style: undefined});
        console.log("Objektua directive buelta eman", error);
      });
    }
  };

  $scope.buelta_eman = function() {
    if (objektua_id > 0) {
      Database.query('SELECT * FROM eszena_objektuak WHERE id = ?', [parseInt(objektua_id)]).then(function(res) {
        var style, style_object;
        if(res[0].style != null) {
          var patroia_scale = /^.* scale\((.*?),.*$/g;
          var patroia_rotate = /^.*rotate\((.*?)deg.*$/g;
          style_object = JSON.parse(res[0].style);
          var scale = style_object.transform.replace(patroia_scale, "$1");
          var rotate = style_object.transform.replace(patroia_rotate, "$1");
          var scale2 = scale * -1;
          var rotate2 = rotate * -1;
          style_object.transform = style_object.transform.replace('scale('+scale, 'scale('+scale2);
          style_object.transform = style_object.transform.replace('rotate('+rotate, 'rotate('+rotate2);
          style = JSON.stringify(style_object);
        } else {
          style = JSON.stringify({ transform: 'translate3d(200px, 350px, 0px) scale(-1, -1) rotate(0)' });
          style_object = { transform: 'translate3d(200px, 350px, 0px) scale(-1, -1) rotate(0)' };
        }

        Database.query('UPDATE eszena_objektuak SET style = ? WHERE id = ?', [style, parseInt(objektua_id)]).then(function(res) {
          $uibModalInstance.close({ aukera:3, style: style_object});
        }, function(error) {
          $uibModalInstance.close({ aukera:3, style: style_object});
          console.log("Objektua directive buelta eman", error);
        });
      }, function(error) {
        $uibModalInstance.close({ aukera:3, style: style_object});
        console.log("Objektua directive buelta eman", error);
      });
    }
  };
  $scope.bikoiztu= function() {
    if (objektua_id > 0) {
      Database.query('SELECT * FROM eszena_objektuak WHERE id = ?', [parseInt(objektua_id)]).then(function(res) {
        var style;

        if(res[0].style != null) {
          var patroia_xy = /^translate3d\((.*?)px, (.*?)px,.*$/g;
          var style_object = JSON.parse(res[0].style);
          var x = style_object.transform.replace(patroia_xy, "$1");
          var y = style_object.transform.replace(patroia_xy, "$2");
          var x2 = parseInt(x) + 20;
          var y2 = parseInt(y) + 20;

          style_object.transform = style_object.transform.replace(x, x2);
          style_object.transform = style_object.transform.replace(y, y2);
          style = JSON.stringify(style_object);
        } else {
          style = JSON.stringify({ transform: 'translate3d(200px, 350px, 0px) scale(1, 1) rotate(0)' });
        }

        Database.query('INSERT INTO eszena_objektuak(fk_eszena, fk_objektua, style) VALUES(?,?,?)', [res[0].fk_eszena, res[0].fk_objektua, style]).then(function(res) {
          var new_id = res.insertId;
          Funtzioak.objektuaEszenara(new_id, true, false, $scope.$parent).then(function() {
            $uibModalInstance.close({ aukera: 2, style: undefined });
          }, function(error) {
            console.log("Objektua directive objektuaEszenara", error);
            $uibModalInstance.close({ aukera: 2, style: undefined });
          });
        }, function(error) {
          $uibModalInstance.close({ aukera: 2, style: undefined });
          console.log("Objektua directive DUPLICATE", error);
        });
      }, function(error) {
        $uibModalInstance.close(2);
        console.log("Objektua directive DUPLICATE", error);
      });
    }
  }
  $scope.itxi = function() {
    $uibModalInstance.close({ aukera: 0, style: undefined });
  };

}]);
