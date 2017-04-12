app.factory('Database', ['$cordovaSQLite', '$q', function($cordovaSQLite, $q) {

  var Database = {},
    db = undefined;

  var init = function() {

    document.addEventListener('deviceready', function() {

      if ($cordovaSQLite !== undefined) {
        db = $cordovaSQLite.openDB({
          name: 'kontaklik.db',
          iosDatabaseLocation: 'Library',
          bgType: 1
        });
      } else {
        init();
      }

    });

  };

  Database.getDatabase = function() {

    if (db === undefined) init();

    return db;

  };

  Database.createTables = function() {
    var d = $q.defer();

    var query_erabiltzaileak = "CREATE TABLE IF NOT EXISTS `erabiltzaileak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`izena` TEXT NOT NULL," +
      "`argazkia` TEXT NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";

    var query_ipuinak = "CREATE TABLE IF NOT EXISTS `ipuinak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`izenburua` TEXT NOT NULL," +
      "`fk_erabiltzailea` INTEGER NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_erabiltzailea ON ipuinak (fk_erabiltzailea);";

    var query_eszenak = "CREATE TABLE IF NOT EXISTS `eszenak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`fk_ipuina` INTEGER NOT NULL," +
      "`fk_fondoa` INTEGER NOT NULL," +
      "`audioa` TEXT NOT NULL," +
      "`orden` INTEGER NOT NULL," +
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_ipuina ON eszenak (fk_ipuina);";

    var query_eszena_objektuak = "CREATE TABLE IF NOT EXISTS `eszena_objektuak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`fk_eszena` INTEGER NOT NULL," +
      "`fk_objektua` INTEGER NOT NULL," +
      "`style` TEXT);" +
      "CREATE INDEX fk_eszena_objektua ON eszena_objektuak (fk_eszena, fk_objektua);";

    var query_eszena_testuak = "CREATE TABLE IF NOT EXISTS `eszena_testuak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`fk_eszena` INTEGER NOT NULL," +
      "`testua` TEXT," +
      "`fontSize` TEXT," +
      "`color` TEXT," +
      "`borderColor` TEXT," +
      "`backgroundColor` TEXT," +
      "`class` TEXT," +
      "`fk_objektua` INTEGER NOT NULL," +
      "`style` TEXT);" +
      "CREATE INDEX fk_eszena ON eszena_testuak (fk_eszena);";

    var query_irudiak = "CREATE TABLE IF NOT EXISTS `irudiak` (" +
      "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "`cordova_file` TEXT NOT NULL," + // applicationDirectory edo dataDirectory
      "`path` TEXT NOT NULL," + // cordova.file horren barrenean path gehiago badago
      "`izena` TEXT NOT NULL," +
      "`atala` TEXT NOT NULL," + // objektua edo fondoa edo bokadiloa
      "`fk_ipuina` INTEGER NOT NULL," +
      "`ikusgai` TINYINT(1) DEFAULT 1," + // menu nagusian jarri bai/ez
      "`timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" +
      "CREATE INDEX fk_ipuina ON irudiak (fk_ipuina);";

    document.addEventListener('deviceready', function() {

      if (db === undefined) init();

      $cordovaSQLite.execute(db, query_erabiltzaileak, []).then(function() {
        $cordovaSQLite.execute(db, query_ipuinak, []).then(function() {
          $cordovaSQLite.execute(db, query_eszenak, []).then(function() {
            $cordovaSQLite.execute(db, query_eszena_objektuak, []).then(function() {
              $cordovaSQLite.execute(db, query_eszena_testuak, []).then(function() {
                $cordovaSQLite.execute(db, query_irudiak, []).then(function() {
                  d.resolve();
                }, function(err) {
                  d.reject(err);
                });
              }, function(err) {
                d.reject(err);
              });
            }, function(err) {
              d.reject(err);
            });
          }, function(err) {
            d.reject(err);
          });
        }, function(err) {
          d.reject(err);
        });
      }, function(err) {
        d.reject(err);
      });

    });

    return d.promise;
  };

  Database.query = function(query, params) {
    params = typeof params !== 'undefined' ? params : [];
    var d = $q.defer();
    var emaitza = [];

    $cordovaSQLite.execute(db, query, params).then(function(res) {

      for (i = 0; i < res.rows.length; i++)
        emaitza.push(res.rows.item(i));

      d.resolve(emaitza);

    }, function(err) {
      d.reject(err);
    });

    return d.promise;
  };

  Database.getRows = function(table, args, extra) {
    var d = $q.defer();

    if (table !== '') {
      var query = 'SELECT * FROM ' + table + ' WHERE 1';
      var values = [];

      Object.keys(args).forEach(function(key) {
        query = query + ' AND ' + key + " = ?";
        values.push(args[key]);
      });

      if (extra !== undefined && extra !== '') {
        query = query + extra;
      }

      document.addEventListener('deviceready', function() {

        if (db === undefined) init();

        $cordovaSQLite.execute(db, query, values).then(function(res) {
          var elementos = [];

          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
              elementos.push(res.rows.item(i));
            }
          }

          d.resolve(elementos);
        }, function(err) {
          d.reject(err);
        });

      });
    } else {
      d.reject('Taula hutsa');
    }

    return d.promise;
  };

  Database.insertRow = function(table, args) {
    var d = $q.defer();
    var keys = [],
      values = [],
      galderak = [];
    var query = 'INSERT INTO ' + table;

    Object.keys(args).forEach(function(key) {
      keys.push(key);
      galderak.push('?');
      values.push(args[key]);
    });

    query = query + '(' + keys.join(',') + ') values (' + galderak.join(',') + ')';

    document.addEventListener('deviceready', function() {

      if (db === undefined) init();

      $cordovaSQLite.execute(db, query, values).then(function(res) {
        d.resolve(res);
      }, function(err) {
        d.reject(err);
      });

    });

    return d.promise;
  };

  Database.deleteRows = function(table, args) {
    var d = $q.defer();

    if (table !== '') {
      var query = 'DELETE FROM ' + table + ' WHERE 1';
      var values = [];

      Object.keys(args).forEach(function(key) {
        query = query + ' AND ' + key + " = ?";
        values.push(args[key]);
      });

      document.addEventListener('deviceready', function() {
        if (db === undefined) init();

        $cordovaSQLite.execute(db, query, values).then(function(res) {

          d.resolve(res);

        }, function(err) {
          d.reject(err);
        });

      });
    } else {
      d.reject('Taula hutsa');
    }

    return d.promise;
  };

  Database.dropTables = function() {
    var d = $q.defer();
    var query = "DROP TABLES";

    document.addEventListener('deviceready', function() {

      if (db === undefined) init();

      $cordovaSQLite.execute(db, query, []).then(function(res) {

        d.resolve(res);

      }, function(err) {
        d.reject(err);
      });

    });

    return d.promise;
  };

  return Database;

}]);
