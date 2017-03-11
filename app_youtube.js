var app = angular.module('app_youtube', []);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// Give the parameter a variable name
var dynamicUrlTitle = getParameterByName('video_id');

app.controller('mediaCtrl', function($scope, $http, $sce) {
  $scope.web_title = "Pragmatic Media - Media Home";
  $scope.banner = {};

  var mainUrl = "https://openws.herokuapp.com/soundcloud?apiKey=8fa0e46f0361117d65d91d6032391324";
  $http.get(mainUrl)
  .then(function success(response) {
    var mediaLibrary = response.data.sort(function(a, b) {
      return parseFloat(b.upload_time) - parseFloat(a.upload_time);
    });
    // change based on html page
    var bannerMedia = mediaLibrary.filter(function(obj){ return obj._id == "58c1adfa6706fa040048091c"});

    $scope.library = mediaLibrary;
    $scope.SetupBannerMedia(bannerMedia[0]);

    }, function error(response){
      console.log(response);
  });

  $scope.displayMedia = function(mediaID) {
    var newBanner = $scope.library.filter(function(obj){ return obj._id == mediaID});

    if(typeof newBanner[0].iframe === 'string') {
      newBanner[0].iframe = newBanner[0].iframe.replace(/auto_play=false/i, 'auto_play=true');
      newBanner[0].iframe = newBanner[0].iframe.replace(/autoplay=0/i, 'autoplay=1');
      newBanner[0].iframe = $sce.trustAsHtml(newBanner[0].iframe);
    }

    $scope.banner = newBanner[0];
    $scope.updateWebInfo(newBanner[0]);
    window.history.pushState(null, "Ty and Slob: " + newBanner[0].title, '/media_library.html?video_id=' + newBanner[0]._id);
  }

  $scope.SetupBannerMedia = function(lastestMediaUpload) {
    var dynamicBanner = $scope.library.filter(function(obj){ return obj._id == dynamicUrlTitle});

    if(dynamicBanner.length !== 0) {
      if(typeof dynamicBanner[0].iframe === 'string') {
        dynamicBanner[0].iframe = $sce.trustAsHtml(dynamicBanner[0].iframe);
      }
      $scope.banner = dynamicBanner[0];
      $scope.updateWebInfo(dynamicBanner[0]);
    }
    else {
      var defaultBanner = lastestMediaUpload;
      defaultBanner.iframe = $sce.trustAsHtml(defaultBanner.iframe);
      $scope.banner = defaultBanner;
    }
  }

  $scope.updateWebInfo = function(data) {
    $scope.web_title = "Ty and Slob: " + data.title;
    $("meta[property='og\\:url']").attr('content', 'http://tyandslob.com/media_library.html?video_id=' + data._id);
    $("meta[property='og\\:site_name']").attr('content', 'http://tyandslob.com/media_library.html?video_id=' + data._id);
  }
});

app.controller('EmailCtrl', function($scope, $http){
  $scope.email = "";
  $scope.submitEmail = function() {
    var emailObj = {"email_address": $scope.email};
    $http.post("https://openws.herokuapp.com/iframes?apiKey=8fa0e46f0361117d65d91d6032391324", emailObj)
      .then(function success(response){
        console.log(response);
      },function error(response){
        console.log(response);
    });
    $('#formContainer').html('<span>Thanks for subscribing!</span>');
  }
});
