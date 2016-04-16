(function() {
  'use strict';

  var app = angular.module('analogPoem', []).run(function($rootScope) {
    $rootScope.lightbox = false;
  });

  app.directive('magnify', [
    '$rootScope',
    function($rootScope) {
      var $lightbox = angular.element('<div class="lightbox no" />');
      angular.element(document.body).append($lightbox);
      $lightbox.bind('click', function(e) {
        e.preventDefault();
        $lightbox.addClass('no');
      });
      return {
        restrict: 'EA',
        link: function($scope, $element, $attrs) {
          var $image = angular.element(document.createElement('img'));
          $image.attr('src', $attrs.src);
          $element.bind('click', function(e) {
            e.preventDefault();
            $lightbox.html($image);
            $lightbox.removeClass('no');
          });
        }
      };
    }
  ]);

})();
