(function() {
  'use strict';

  var $lightbox;

  var app = angular.module('analogPoem', []).run(function($rootScope, $timeout) {
    $lightbox = angular.element('<div class="lightbox off" />');
    angular.element(document.body).append($lightbox);

    $lightbox.bind('click', closeLightbox);
    angular.element(document.body).bind('keydown', function(e) {
      var code = e.keyCode;
      // console.log(e.keyCode);
      switch(code) {
        case 27:
          closeLightbox();
          break;
      }
    });

    function closeLightbox() {
      $lightbox.addClass('off');
      $timeout(function() {
        $lightbox.html('');
      }, 300);
    }
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

  app.directive('magnifyVideo', [
    '$sce',
    function($sce) {
      return {
        restrict: 'EA',
        template: '<div class="video-wrapper video-thumbnail"></div>',
        link: function($scope, $element, $attrs) {
          $scope.videoSrc = $sce.trustAsResourceUrl($attrs.magnifyVideo);
          var $container = angular.element($element[0].querySelector('.video-wrapper'));

          var $iframe = angular.element(document.createElement('iframe'));
          $iframe.attr('src', $scope.videoSrc);
          $iframe.attr('width', 800);
          $iframe.attr('height', 640);
          $iframe.attr('frameborder', 0);
          $iframe.attr('webkitallowfullscreen', 'webkitallowfullscreen');
          $iframe.attr('mozallowfullscreen', 'mozallowfullscreen');
          $iframe.attr('allowfullscreen', 'allowfullscreen');

          $container.html($iframe).css('position', 'relative');

          var $video = angular.copy($iframe);
          $video.attr('src', $sce.trustAsResourceUrl($attrs.magnifyVideo + '?autoplay=1'));

          var $clickArea = angular.element(document.createElement('div'));
          $clickArea.addClass('fill-container');
          $clickArea.bind('click', function(e) {
            e.preventDefault();
            console.warn($video);
            $lightbox.html(angular.copy($video));
            $lightbox.removeClass('off');
          });
          $container.append($clickArea);
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
              newSlide.playIconColor = slide.getAttribute('play-icon-color') || '#333';
              console.warn(newSlide);
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
