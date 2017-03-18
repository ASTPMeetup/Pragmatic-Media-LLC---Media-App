var app = angular.module('app', []);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var dynamicUrlTitle = getParameterByName('video_id');

app.controller('MediaCtrl', function($scope, $http, $sce) {
  $scope.web_title = "Pragmatic Media - Media Home";
  $scope.banner = {};

  var mainUrl = "https://openws.herokuapp.com/soundcloud?apiKey=8fa0e46f0361117d65d91d6032391324";
  $http.get(mainUrl)
  .then(function success(response) {
      var mediaLibrary = response.data;

      mediaLibrary.sort(function(a, b) { return parseFloat(b.upload_time) - parseFloat(a.upload_time); });

      $scope.library = mediaLibrary;
      $scope.SetupBannerMedia(response.data[0]);

    }, function error(response){
      console.log(response);
  });

  $scope.displayMedia = function(video_id) {
    var newBanner = $scope.library.filter(function(obj){ return obj._id == video_id});

    if(typeof newBanner[0].iframe === 'string') {
      newBanner[0].iframe = newBanner[0].iframe.replace(/auto_play=false/i, 'auto_play=true');
      newBanner[0].iframe = newBanner[0].iframe.replace(/autoplay=0/i, 'autoplay=1');
      newBanner[0].iframe = $sce.trustAsHtml(newBanner[0].iframe);
    }

    $scope.banner = newBanner[0];
    $scope.updatePageMetaData(newBanner[0]);
    window.history.pushState(null, "Ty and Slob: " + newBanner[0].title, '/media_library.html?video_id=' + newBanner[0]._id);
  }

  $scope.SetupBannerMedia = function(defaultURL) {
    var dynamicBanner = $scope.library.filter(function(obj){ return obj._id == dynamicUrlTitle});
    var HTMLVideoID = $("#mediaPlayer").data("video-id");

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
      var pageMediaBanner = $scope.library.filter(function(obj){ return obj._id == HTMLVideoID});
      pageMediaBanner[0].iframe = $sce.trustAsHtml(pageMediaBanner[0].iframe);
      $scope.banner = pageMediaBanner[0];
    }
    // else use latest media uploaded to REST API
    else {
      var defaultBanner = defaultURL
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

app.controller('EmailCtrl', function($scope, $http){
  $scope.email = "";
  $scope.submitEmail = function() {
    var emailObj = {"email_address": $scope.email};
    $http.post("https://openws.herokuapp.com/emails?apiKey=8fa0e46f0361117d65d91d6032391324", emailObj)
      .then(function success(response){
        console.log(response);
      },function error(response){
        console.log(response);
    });
    $('#formContainer').html('<span>Thanks for subscribing!</span>');
  }
});
