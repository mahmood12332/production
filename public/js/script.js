// script.js

    // create the module and name it scotchApp
        // also include ngRoute for all our routing needs    
    var mapp = angular.module("MyApp", ['firebase','ngRoute','ngMap','angular.ujs','ngCookies']);
         var config = {
            apiKey: "AIzaSyBfy_TN79UUuzWTniXfUN_xFyMAfCZLJeg",
            authDomain: "namazi-5a144.firebaseapp.com",
            databaseURL: "https://namazi-5a144.firebaseio.com",
            projectId: "namazi-5a144",
            storageBucket: "namazi-5a144.appspot.com",
            messagingSenderId: "701086051313"
          };
          firebase.initializeApp(config);
        var db = firebase.database();
        // var fbAuth = $firebaseAuth();

        mapp.run(["$rootScope", "$location", function($rootScope, $location) {
        $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
          // We can catch the error thrown when the $requireAuth promise is rejected
          // and redirect the user back to the home page
          if (error === "AUTH_REQUIRED") {
            $location.path("/");
          }
        });
        }]);
        mapp.factory("Auth", ["$firebaseAuth",
          function($firebaseAuth) {
            return $firebaseAuth();
          }
        ]);
    // configure our routes
    mapp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/login.html',
                controller  : 'loginController'
            })
            .when('/login', {
                templateUrl : 'pages/login.html',
                controller  : 'loginController'
            })
             .when('/map', {
                templateUrl : 'pages/map.html',
                controller  : 'MyController'
            })

            // route for the about page
            .when('/admin', {
                templateUrl : 'pages/admin.html',
                controller  : 'adminController',
                resolve: {
                  "currentAuth" : ["Auth",function(Auth){
                    return Auth.$requireSignIn();
                  }]
                }
            })

            // route for the contact page
            .when('/:id/detail', {
                templateUrl : 'pages/detail.html',
                controller  : 'detailController',
                resolve: {
                  "currentAuth" : ["Auth",function(Auth){
                    return Auth.$requireSignIn();
                  }]
                }
            })
            .when('/request', {
              templateUrl : 'pages/request.html',
              controller  : 'requestController',
              resolve: {
                "currentAuth" : ["Auth",function(Auth){
                  return Auth.$requireSignIn();
                }]
              }
            })
            .otherwise({
              redirectTo: '/' 
            });
    });
    mapp.run(function($window) {
      $window.var1 = 'production';
      $window.var2 = 'production';
    });
    mapp.controller('MyController', function(NgMap) {
        var vm = this;
      NgMap.getMap().then(function(map) {
        vm.showCustomMarker= function(evt) {
          map.customMarkers.foo.setVisible(true);
          map.customMarkers.foo.setPosition(this.getPosition());
        };
        vm.closeCustomMarker= function(evt) {
          this.style.display = 'none';
        };
      });
    });
    mapp.config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);
    // create the controller and inject Angular's $scope
    mapp.controller('loginController',['$scope', '$firebaseObject', '$firebaseAuth', '$firebaseArray','$window','$cookies', function($scope, $firebaseObject, $firebaseAuth, $firebaseArray,$window,$cookies){              
      $scope.variables = $window.var1;      
      $scope.toggleResponseValue = function(response){
        console.log(response)
        if(response == true){
          $scope.variables = $window.var2; //Assume it's not clicked if there's no existing value
        }else{
          $scope.variables = $window.var1;
        }
      };
      $scope.SetCookies = function () {
        $cookies.put("variables",$scope.variables);
      };
      $scope.GetCookies = function () {
          $window.alert($cookies.get('variables'));
      };
      $scope.ClearCookies = function () {
          $cookies.remove('variables');
      };
      $scope.fbAuth = $firebaseAuth();
      $scope.err = {};
      $scope.btn_hide = true;
        //var authData = fbAuth.$getAuth();
      $scope.fbAuth.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
          console.log("Signed in as:", firebaseUser.email);
          $scope.btn_show = true;
          $scope.btn_hide = false;
        } else {
          console.log("Signed out");
          $scope.btn_hide = true;
          $scope.btn_show = false;
        }
      });
      $scope.username = "namazi@gmail.com";
      $scope.password= "12345678";
      $scope.logmein = function(username, password) {
        $scope.fbAuth.$signInWithEmailAndPassword(
            username,
            password
        ).then(function(authData) {
            $scope.err.message = "Successfully Logged in as " + authData.uid +" "+authData.providerId;
          $scope.btn_hide = false;
          $scope.reload();
          $scope.redirect();
        }).catch(function(error) {
          $scope.err.message = error;
            console.error("ERROR: " + error);
          $scope.btn_hide = true;
        });
            };

        $scope.redirect = function(){
          window.location = "/#!/admin";
        }
  
      $scope.regmein = function(usernames, passwords) {
        $scope.fbAuth.$createUserWithEmailAndPassword(
            usernames,
            passwords
        ).then(function(authData) {
            // $scope.err.message = "User registered "+authData.uid;
            // // $scope.load();
            console.log("here")
            $scope.populate()
            $scope.logmein($scope.username, $scope.password);
        }).catch(function(error) {
          $scope.err.message = error;
            console.error("ERROR: " + error);
        });

    };
    // $scope.reload = function()
    // {
       

    // };
    $scope.reload = function(){
       location.reload(); 
    }
  
  $scope.logmeout = function() {
    $scope.fbAuth.$signOut();
    $scope.err.message = "Logged Out";
    $scope.redirects();
    $scope.reload();
  };
  $scope.redirects = function(){
          window.location = "/#!/login";
        }
    $scope.deleteuser = function() {
    $scope.fbAuth.$deleteUser();
    $scope.err.message = "User Deleted";
      $scope.btn_hide = true;
  };
  
     $scope.checkstatus = function(){
       var authData = $scope.fbAuth.$getAuth();

        if (authData) {
           $scope.err.message = "Logged in as: " + authData.uid +" "+ authData.email+" "+ authData.password;
          
            $scope.btn_hide = false;
          
        } else {
           $scope.err.message = "Not Logged in!";
          $scope.btn_hide = true;
        }
      };
//   $scope.populate = function(){
//     var ref = db.ref("/production");
//     syncObject = $firebaseObject(ref);
//     syncObject.$bindTo($scope, "data");                                         
    
//     syncObject.$watch(function(info) {
//      console.log("$scope: Data Changed on the Server", info);
//      });
    
//   };

  
  $scope.populate = function(){
    var authData = $scope.fbAuth.$getAuth();
    if (authData){
    var refPath = "/production/users";
    so = $firebaseArray(db.ref(refPath));
    so.$add({
      email: $scope.usernames,
      user_Type: "user",
      fullName:$scope.fullName,
      phoneNum:$scope.phoneNum
    }).then(function(dat){
      console.log('here-1');
      $scope.err.message = "Data uploaded";
    });
    }
  };
  $scope.cusauth = function() {
     // e.preventDefault();
    var sec = '';
    var tokenGenerator = new FirebaseTokenGenerator(sec);
    var token = tokenGenerator.createToken({ uid: "5KuXbpGU2AP3zUYcP2PvcaoUQOT", role: "Admin", username: "testadmin@test.com" });

    console.log(token);
            
           var ref = new Firebase("https://namazi-5a144.firebaseio.com/");
        $scope.fbAuth.$signInWithCustomToken(token, function(authData) {
          if (authData) {
            console.log("Login Succeeded!", authData);
          } else {
            console.log("Login Failed!");
          }
        });
    $scope.fbAuth.$signInWithCustomToken(token)
    .then(function(authData) {
            $scope.err.message = "User registered "+authData.uid;
      console.log("Custom Login success: " , authData);
        }).catch(function(error) {
          $scope.err.message = "Error" + error;
            console.error("ERROR: " + error);
        });
  };
  
}]);




  mapp.controller('detailController',['$scope','$firebaseObject', '$firebaseArray', 'Auth','$location','$routeParams','$window', function($scope,$firebaseObject, $firebaseArray, Auth,$location,$routeParams,$window){
      $scope.variables = $window.var1;      
      $scope.toggleResponseValue = function(response){
        console.log(response)
        if(response == true){
          $scope.variables = $window.var2; //Assume it's not clicked if there's no existing value
        }else{
          $scope.variables = $window.var1;
        }
      };
      var aout = Auth.$getAuth();
      if (aout){
      // var reff = '/production/Masjids'+aout.Identifier;
        // if (aout.email=='testadmin@test.com'){
        //   reff = '/production/Masjids';
        // }

        console.log($routeParams.id)
        // $scope.uid = {};
        // $scope.lst = {};
        // $scope.list = [];
        // $scope.lst = $firebaseArray(db.ref(reff));
        $scope.newlst =$firebaseObject(db.ref('/production/Masjids').child($routeParams.id));
        // $scope.user = $firebaseArray(db.ref('/production/Masjids'));
            
        // $scope.lst.$loaded().then(function(object){
        //  $scope.lst = object;
        //  console.log($scope.lst)
        // });

        $scope.newlst.$loaded().then(function(object){

        $scope.list = object;
        if (object.length < 1 ) {
          console.log("true")    
        } else {
          console.log("else")   
        }
        console.log($scope.list)
        console.log($scope.list.length)
        });
    }
}]);

 mapp.controller('adminController',['$scope','$firebaseObject', '$firebaseArray', 'Auth','$location','$window','$cookies', function($scope,$firebaseObject, $firebaseArray, Auth,$location,$window,$cookies){
  console.log($cookies.variables);
  $window.variables = $scope.fbdata;
  var aout = Auth.$getAuth();
  if (aout){
  var reff = '/production/Masjids'+aout.Identifier;
    if (aout.email=='testadmin@test.com'){
      reff = '/production/Masjids';
    }

    
    // $scope.uid = {};
    // $scope.lst = {};
    $scope.list = [];
    // $scope.lst = $firebaseArray(db.ref(reff));
    $scope.newlst = $firebaseArray(db.ref('/production/Masjids'));
    // $scope.user = $firebaseArray(db.ref('/production/Masjids'));
         
    // $scope.lst.$loaded().then(function(object){
    //  $scope.lst = object;
    //  console.log($scope.lst)
    // });

    $scope.newlst.$loaded().then(function(object){

     $scope.list = object;
     if (object.length < 1 ) {
       console.log("true")    
     } else {
      console.log("else")   
     }
     console.log($scope.list)
     console.log($scope.list.length)
    });
    $scope.delete = function(object) {
      if (confirm("sure to delete")) {
        // console.log("here")
        $scope.list.$remove(object);
        alert('DONE!')
      }
      else{
        console.log("here")
      }
  };
}
}]);    
mapp.controller('requestController',['$scope','$firebaseObject', '$firebaseArray', 'Auth','$location','$routeParams', function($scope,$firebaseObject, $firebaseArray, Auth,$location,$routeParams){
     
  var aout = Auth.$getAuth();
  if (aout){
    // var reff = '/production/Masjids'+aout.Identifier;
    // if (aout.email=='testadmin@test.com'){
    //   reff = '/production/Masjids';
    // }

    console.log($routeParams.id)
    // $scope.uid = {};
    // $scope.lst = {};
    // $scope.list = [];
    // $scope.lst = $firebaseArray(db.ref(reff));
    $scope.newlst =$firebaseArray(db.ref('/production/newRequests'));
    // $scope.user = $firebaseArray(db.ref('/production/Masjids'));
         
    // $scope.lst.$loaded().then(function(object){
    //  $scope.lst = object;
    //  console.log($scope.lst)
    // });

    $scope.newlst.$loaded().then(function(object){

     $scope.list = object;
     if (object.length < 1 ) {
       console.log("true")    
     } else {
      console.log("else")   
     }
     console.log($scope.list)
     console.log($scope.list.length)
    });

    $scope.delete = function(object) {
      if (confirm("sure to delete")) {
        // console.log("here")
        $scope.list.$remove(object);
        alert('DONE!')
      }
      else{
        console.log("here")
      }
  };
  
}
}]);