(function() {
  'use strict';

  var $lightbox;

  var app = angular.module('analogPoem', []).run(function($rootScope) {
    $lightbox = angular.element('<div class="lightbox off" />');
    angular.element(document.body).append($lightbox);

    $lightbox.bind('click', function() {
      $lightbox.addClass('off');
    });
    angular.element(document.body).bind('keydown', function(e) {
      var code = e.keyCode;
      // console.log(e.keyCode);
      switch(code) {
        case 27:
          $lightbox.addClass('off');
          break;
      }
    });
  });

  app.directive('magnify', [
    function() {
      return {
        restrict: 'EA',
        link: function($scope, $element, $attrs) {
          var $image = angular.element(document.createElement('div'));
          $image.attr('style', 'background-image: url(' + $attrs.src + ')').addClass('image');
          $element.bind('click', function(e) {
            e.preventDefault();
            $lightbox.html(angular.copy($image));
            $lightbox.removeClass('off');
          });
        }
      };
    }
  ]);

  app.directive('slideshow', [
    '$sce',
    '$timeout',
    function($sce, $timeout) {
      return {
        restrict: 'EA',
        transclude: true,
        templateUrl: 'templates/slideshow.html',
        replace: true,
        link: function($scope, $element, $attrs, $ctrl, $transclude) {
          var matchMobile = window.matchMedia('(max-width: 767px)');
          angular.extend($scope, {
            slideshow: undefined,
            thumbnails: undefined,
            current: {
              idx: 0
            },
            slides: [],
            lazyAfter: 2,
            mobile: matchMobile.matches,
            goto: goto
          });
          var slides = $transclude();
          angular.forEach(slides, function(slide, idx) {
            if (slide.nodeType === 1) {
              var newSlide = {};
              if (slide.getAttribute('image')) {
                newSlide.image = slide.getAttribute('image');
                newSlide.thumbnail = slide.getAttribute('thumbnail') || newSlide.image;
              } else if (slide.getAttribute('video')) {
                var src = slide.getAttribute('video');
                if (src.match('youtube')) {
                  newSlide.youtube = true;
                } else if (src.match('vimeo')) {
                  newSlide.vimeo = true;
                }
                newSlide.video = $sce.trustAsResourceUrl(src);
                newSlide.thumbnail = slide.getAttribute('thumbnail');
              }
              $scope.slides.push(newSlide);
            }
          });
          $timeout(function() {
            if ($scope.mobile) {
              appearLazy();
            } else {
              $scope.slideshow = angular.element($element[0].querySelector('.slideshow'));
              $scope.slideshow.slick({
                infinite: true,
                speed: 300,
                fade: true,
                prevArrow: '<div class="slick-prev"><i class="fa fa-chevron-left"></i></div>',
                nextArrow: '<div class="slick-next"><i class="fa fa-chevron-right"></i></div>',
                // adaptiveHeight: true,
                lazyLoad: 'ondemand',
                cssEase: 'linear',
                responsive: [{
                  breakpoint: 767,
                  settings: 'unslick'
                }]
              });
              $scope.thumbnails = angular.element($element[0].querySelector('.thumbnails'));
              $scope.thumbnails.slick({
                accessibility: false,
                infinite: true,
                arrows: false,
                speed: 300,
                slidesToShow: 8,
                slidesToScroll: 8,
                cssEase: 'linear'
              });

              $scope.slideshow.on('afterChange', function(slick, lastSlide, currentSlide) {
                $scope.current.idx = currentSlide;
                $scope.thumbnails.slick('slickGoTo', currentSlide + 1);
                $scope.$applyAsync();
              });
            }
          });
          function goto(idx) {
            $scope.slideshow.slick('slickGoTo', idx);
          }
        }
      };
    }
  ]);

})();
