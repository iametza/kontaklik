'use strict';

/**
 * @ngdoc overview
 * @name haziakApp
 * @description
 * # haziakApp
 *
 * Main module of the application.
 */
var app = angular.module('haziakApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',   
    'ui.bootstrap',
    'hmTouchEvents',
    'ngCordova'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/erabiltzaileak.html',
        controller: 'ErabiltzaileakCtrl'
      })
      .when('/ipuinak/:erabiltzailea_id', {
        templateUrl: 'views/ipuinak.html',
        controller: 'IpuinakCtrl'
      })
      .when('/ipuinak/:erabiltzailea_id/:ipuina_id', {
        templateUrl: 'views/ipuina.html',
        controller: 'IpuinaCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
})
.run(['Database', function(Database){
  //Database.dropTables();
  Database.createTables();
}]);
