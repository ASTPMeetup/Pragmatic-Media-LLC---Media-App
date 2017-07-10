'use strict';
const app = angular.module('app', []);
const dynamicUrlTitle = getParameterByName('video_id');
const mediaCtrlUrl = "https://openws.herokuapp.com/soundcloud?apiKey=8fa0e46f0361117d65d91d6032391324";
const emailCtrlUrl = "https://openws.herokuapp.com/iframes?apiKey=8fa0e46f0361117d65d91d6032391324";

// Changes url based on video being viewed for social sharing
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// Make page-scroll links pull down page slowly
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        let $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutQuad');
        event.preventDefault();
    });
});


// MEDIA LIBRARY CONTROLLER ------------------- //
app.controller('MediaCtrl', function($scope, $http, $sce) {
  $scope.web_title = "Pragmatic Media - Media Home";
  $scope.banner = {};

  $http.get(mediaCtrlUrl)
  .then(function success(response) {
      let mediaLibrary = response.data;

      mediaLibrary.sort(function(a, b) { return parseFloat(b.upload_time) - parseFloat(a.upload_time); });

      mediaLibrary.forEach(function(media){

        //grab the youtube video id if it exists
        if (media.iframe.match(/youtube/)) {
          let youtube_video_id = media.iframe.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();
          media.thumbnail = 'http://img.youtube.com/vi/'+youtube_video_id+'/0.jpg';
        } else {
          media.thumbnail = 'images/logo.jpg';
        }
        media.iframe = media.iframe.replace(/auto_play=false/i, 'auto_play=true');
        media.iframe = media.iframe.replace(/autoplay=0/i, 'autoplay=1');
      });

      $scope.library = mediaLibrary;
      $scope.SetupBannerMedia(response.data[0]);

      }, function error(response){
        console.log(response);
  });

  $scope.displayMedia = function(video_id) {
        let newBanner = $scope.library.filter(function(obj){ return obj._id == video_id});
        newBanner[0].iframe = $sce.trustAsHtml(newBanner[0].iframe);

        $scope.banner = newBanner[0];

        $scope.updatePageMetaData(newBanner[0]);
        window.history.pushState(null, "Ty and Slob: " + newBanner[0].title, window.location.pathname + '?video_id=' + newBanner[0]._id);
  }

  $scope.SetupBannerMedia = function(defaultURL) {
        let dynamicBanner = $scope.library.filter(function(obj){ return obj._id == dynamicUrlTitle});
        const HTMLVideoID = $("#mediaPlayer").data("video-id");

        // if url has special video id attribute
        if(dynamicBanner.length !== 0) {
          if(typeof dynamicBanner[0].iframe === 'string') {
            dynamicBanner[0].iframe = $sce.trustAsHtml(dynamicBanner[0].iframe);
          }
          $scope.banner = dynamicBanner[0];
          $scope.updatePageMetaData(dynamicBanner[0]);
        }
        //if HTML page as unique video id attribute
        else if (HTMLVideoID){
          let pageMediaBanner = $scope.library.filter(function(obj){ return obj._id == HTMLVideoID});
          pageMediaBanner[0].iframe = $sce.trustAsHtml(pageMediaBanner[0].iframe);
          $scope.banner = pageMediaBanner[0];
        }
        // else use latest media uploaded to REST API
        else {
          let defaultBanner = defaultURL;
          defaultBanner.iframe = defaultBanner.iframe.replace(/auto_play=true/i, 'auto_play=false');
          defaultBanner.iframe = defaultBanner.iframe.replace(/autoplay=1/i, 'autoplay=0');
          defaultBanner.iframe = $sce.trustAsHtml(defaultBanner.iframe);
          $scope.banner = defaultBanner;
        }
  }

  $scope.updatePageMetaData = function(data) {
        $scope.web_title = "Ty and Slob: " + data.title;
        $("meta[property='og\\:url']").attr('content', 'http://tyandslob.com/media_library.html?video_id=' + data._id);
        $("meta[property='og\\:site_name']").attr('content', 'http://tyandslob.com/media_library.html?video_id=' + data._id);
  }
});


// EMAIL MARKETING CONTROLLER ------------------- //
app.controller('EmailCtrl', function($scope, $http){
      $scope.email = "";
      $scope.submitEmail = function() {
        const emailObj = {"email_address": $scope.email};
        $http.post(emailCtrlUrl, emailObj)
          .then(function success(response){
            console.log(response.data);
          },function error(response){
            console.log(response);
        });
        $('#formContainer').html('<span>Thanks for subscribing!</span>');
      }
});
