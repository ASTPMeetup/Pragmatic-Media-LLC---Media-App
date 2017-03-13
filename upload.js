var app = angular.module('post_app',[]);
var date = new Date();
var mainUrl = "https://openws.herokuapp.com/soundcloud?apiKey=8fa0e46f0361117d65d91d6032391324";

$('#title').on('input', function(){
	$('#status').empty();
})

class postObject {
	constructor(HTMLframe, title, description) {
		this.id = Date.now().toString().slice(-6);
		this.upload_time = Date.now();
		this.title = title;
		this.description = description;
		this.date = date.toLocaleDateString();
		this.iframe = HTMLframe;
	}
}

app.controller('UploadCtrl', function($scope, $http){
	$scope.title = "";
	$scope.description = "";
	$scope.iframe = "";
	$scope.submitMedia = function(){
		var embed = $scope.iframe.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
		if (embed.includes("youtube")) { embed += '?autoplay=0'; }
		var HTMLframe = '<iframe class=\"embed-responsive-item\" scrolling=\"no\" frameborder=\"no\" src=\"' + embed + '?autoplay=0\" allowfullscreen></iframe>';
		var newObj = new postObject(HTMLframe, $scope.title, $scope.description);
		newObj = JSON.stringify(newObj);

		console.log(newObj);
		$scope.postNewObject(newObj);
	}
	$scope.postNewObject = function(newObj) {
		$http.post(mainUrl, newObj)
		.then(function success(response) {

		    console.log(response);
				$('#form')[0].reset();
				$('#status').html(" Success!");
				
		  }, function error(response){
		    console.log(response);
				$('#status').text(" Something went wrong..");
		});
	}
});
