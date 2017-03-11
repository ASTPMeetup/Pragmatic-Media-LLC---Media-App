var newObject = {};
$http.post(mainUrl, newObject)
.then(function success(response) {
    console.log(response);
  }, function error(response){
    console.log(response);
});

var deleteObject = "58c1ab2c6706fa0400480915";
$http.delete(deleteObject)
.then(function success(response) {
    console.log(response);
  }, function error(response){
    console.log(response);
});
