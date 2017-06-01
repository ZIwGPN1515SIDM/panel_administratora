var app = angular.module('app', ['ui.bootstrap', 'components', "ngRoute", "ngCookies", "ngMap"]);

var categoryList = [];
var areaList = [];
var tmpId = -1;
var photoMode = -1; //1 - PLACE, 2 - NAMESPACE

//Konfiguracja widoków
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "view/startPage.htm"
        })
        .when("/placeList", {
            templateUrl: "view/placeList.htm"
        })
        .when("/login", {
            templateUrl: "view/login.htm"
        })
        .when("/register", {
            templateUrl: "view/registerUser.htm"
        })
        .when("/registerSuccess", {
            templateUrl: "view/registerSuccess.htm"
        })
        .when("/license", {
            templateUrl: "view/enterLicense.htm"
        })
        .when("/addPlace", {
            templateUrl: "view/addPlace.htm"
        })
        .when("/addNamespace", {
            templateUrl: "view/addNamespace.htm"
        })
        .when("/addPhoto", {
            templateUrl: "view/addPhoto.htm"
        })
        .when("/photoList", {
            templateUrl: "view/photoList.htm"
        })
        .when("/editPlace", {
            templateUrl: "view/editPlace.htm"
        })
        .when("/editNamespace", {
            templateUrl: "view/editNamespace.htm"
        })
});

//Kontrolery
app.controller('Init', function ($scope, $http, $location, $cookies) {

    if (angular.isUndefined($cookies.getAll().session_token)) {
        $location.path("/login");
    } else {
        $http.get("http://graymanix.ovh/api/v2/user/session?session_token=" + $cookies.get("session_token"))
            .then(function (response) {

            }, function (error) {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            })
    }

});

app.controller('LoginController', function ($scope, $http, $cookies, $location, $uibModal) {


    this.login = function (name, password) {
        var tmp = {
            email: name,
            password: password
        };

        $http.post("http://graymanix.ovh/api/v2/login?api_key=bf980aeea5db5fb03ddafb29a4375d2497b91d81ac836a030abfef9a5573e994", JSON.stringify(tmp))
            .then(function (response) {
                if (response.status == "200" && response.data.LICENSE == true) {
                    console.log(response.data);
                    $cookies.put("session_token", response.data.session_token);
                    $cookies.put("userid", response.data.USERSID);
                    $location.path("/");
                } else {
                    console.log(response.data);
                    $cookies.put("session_token", response.data.session_token);
                    $cookies.put("userid", response.data.USERSID);
                    $location.path("/license");
                }
            }, function (error) {
                openError();
                console.log(error);
            })
    };

    var openError = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'modal/loginError.htm',
            controller: ModalInstanceCtrl,
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            size: 'lg'
        });
    }

});

app.controller('RegisterController', function ($scope, $http, $cookies, $location, $uibModal) {

    this.register = function (firstName, lastName, email) {
        var tmp = {
            name: firstName + "_" + lastName,
            email: email
        };
        console.log(JSON.stringify(tmp));
        $http.post("http://graymanix.ovh/api/v2/register?api_key=bf980aeea5db5fb03ddafb29a4375d2497b91d81ac836a030abfef9a5573e994", JSON.stringify(tmp)).then(function (response) {
            if (response.status == "200") {
                $location.path("/registerSuccess");
            }
        }, function (error) {
            console.log(error);
            console.log(error.data.error);
            console.log(error.data.error.message);
            if (error.status == "401") {
                $cookies.remove("session_token");
                $location.path("/login");
            } else {
                openError();
            }
        })
    };

    var openError = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'modal/registerError.htm',
            controller: ModalInstanceCtrl,
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            size: 'lg'
        });
    }

});

app.controller('TopBarController', function ($scope, $http, $location, $cookies) {
    this.logout = function () {
        var tmp = {
            session_token: $cookies.get("session_token")
        };
        $http.post("http://graymanix.ovh/api/v2/user/session?session_token=" + $cookies.get("session_token"), tmp, {headers: {'X-HTTP-METHOD': 'DELETE'}}).then(function (response) {
            $cookies.remove("session_token");
            $cookies.remove("userid");
            $location.path("/login");
        });

    }
});

app.controller('NamespaceTableController', function ($scope, $http, $location, $cookies, $uibModal) {

    $http.get("http://graymanix.ovh/api/v2/panel/namespace?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff", {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            console.log(response);
            if (response.status == "200") {
                $scope.names = response.data.resource;
            }
        }, function (error) {
            console.log(error);
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    this.addNamespace = function () {
        $location.path("/addNamespace");
    };

    this.photos = function (namespace) {
        tmpId = namespace.ID;
        photoMode = 2;
        $location.path("/photoList");
    }
});

app.controller('PlaceTableController', function ($scope, $http, $location, $cookies, $uibModal) {

    $http.get("http://graymanix.ovh/api/v2/panel/place?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff", {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            console.log(response);
            if (response.status == "200") {
                $scope.names = response.data.resource;
            }
        }, function (error) {
            console.log(error);
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    this.addPlace = function () {
        $location.path("/addPlace");
    };

    this.photos = function (place) {
        tmpId = place.ID;
        photoMode = 1;
        $location.path("/photoList");
    }
});

app.controller('LicenseController', function ($scope, $http, $location, $cookies, $uibModal) {
    this.activateLicense = function (key) {
        var req = {
            resource: [
                {
                    CODE: key,
                    USERSID: $cookies.get("userid")
                }
            ]
        };
        console.log(JSON.stringify(req));
        $http.post("http://graymanix.ovh/api/v2/license/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
            req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
            .then(function (response) {
                console.log(response);
                if (response.status == "200") {
                    $location.path("/");
                }
            }, function (error) {
                console.log(error);
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });

        //$location.path("/");
    }
});

app.controller('AddPlaceController', function ($scope, $http, $location, $cookies, $uibModal) {


    $scope.areas = areaList;

    $http.get("http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES?fields=ID%2C%20NAME&api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe").then(function (response) {
        if (response.status == "200") {
            areaList.length = 0;
            areaList.push("-- Wybierz obszar --");
            $scope.addPlaceForm.placeArea = "-- Wybierz obszar --";
            angular.forEach(response.data.resource, function (value, key) {
                areaList.push(value.ID + ". " + value.NAME);
            });
            console.log(response);
        }
    });

    this.addPlace = function () {
        if (placeArea.value.substring(7, 8) != "-") {
            var req = {
                resource: [
                    {
                        NAME: placeName.value,
                        DESCRIPTION: placeDescription.value,
                        EVENT_CONTENT: eventContent.value,
                        EVENT_NAME: eventName.value,
                        EVENT_END: eventEnd.value,
                        ADVERT: advertContent.value,
                        NAMESPACE_ID: placeArea.value.substring(7, 8),
                        INSTANCE: placeName.value.substring(0, 4)
                    }
                ]
            };
            console.log(JSON.stringify(req));

            $http.post("http://graymanix.ovh/api/v2/panel/place/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
                req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
                .then(function (response) {
                    console.log(response);
                });
        } else {
            //TODO
        }
    }

});

app.controller('AddNamespaceController', function ($scope, $http, $location, $cookies, $uibModal, NgMap) {

    var vm = this;
    var lng = 0, lat = 0;
    $scope.categories = categoryList;

    $http.get("http://graymanix.ovh/api/v2/category?api_key=be503ed4e9249384e58aad5d34ba46acbad352350b19050b7410ea1049dbef77").then(function (response) {
        if (response.status == "200") {
            categoryList.length = 0;
            categoryList.push("-- Wybierz kategorię --");
            $scope.addNamespaceForm.placeCategory = "-- Wybierz kategorię --";
            angular.forEach(response.data.categories, function (value, key) {
                categoryList.push(value.ID + ". " + value.NAME);
            });
            console.log(categoryList);
        }
    });

    this.addNamespace = function () {
        if (placeCategory.value.substring(7, 8) != "-") {
            var req = {
                resource: [
                    {
                        NAME: placeName.value,
                        DESCRIPTION: placeDescription.value,
                        EVENT_CONTENT: eventContent.value,
                        EVENT_NAME: eventName.value,
                        EVENT_END: eventEnd.value,
                        ADVERT: advertContent.value,
                        LATITUDE: lat,
                        LONGITUDE: lng,
                        CATEGORY_ID: placeCategory.value.substring(7, 8),
                        INSTANCE: placeName.value.substring(0, 4)
                    }
                ]
            };

            console.log(placeCategory.value.substring(7, 8));
            console.log(JSON.stringify(req));

            $http.post("http://graymanix.ovh/api/v2/panel/namespace/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
                req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
                .then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
        } else {
            //TODO
        }
    };

    NgMap.getMap().then(function (map) {
        vm.map = map;
        google.maps.event.trigger(map, 'resize');
    });

    this.placeMarker = function (e) {
        var tmp = e.latLng;
        latitude.value = tmp.lat();
        longitude.value = tmp.lng();
        lat = tmp.lat();
        lng = tmp.lng();
    }
});

app.controller('AddPhotoController', function ($scope, $http, $location, $cookies) {

    this.addPhoto = function (link) {
        console.log(link);
        var payload = {};
        var url = "";
        if (photoMode == 1) {
            payload = {
                resource: [
                    {
                        URL: link,
                        PLACE_ID: tmpId
                    }
                ]
            };
            url = "http://graymanix.ovh/api/v2/sidm/_table/PLACES_PHOTOS?api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe"
        }
        else {
            payload = {
                resource: [
                    {
                        URL: link,
                        NAMESPACE_ID: tmpId

                    }
                ]
            };
            url = "http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES_PHOTOS?api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe"
        }

        $http.post(url, JSON.stringify(payload))
            .then(function (response) {
                if (response.status == "200") {
                    $location.path("/photoList");
                }
            }, function (error) {
                console.log(error);
                //TODO
            });
    };

    this.back = function () {
        $location.path("/photoList");
    };

});

app.controller('PhotoListController', function ($scope, $http, $location, $cookies) {

    console.log(tmpId);

    var tableName = photoMode == 1 ? "PLACES_PHOTOS" : "NAMESPACES_PHOTOS";
    var filter = photoMode == 1 ? ("PLACE_ID%3D" + tmpId) : ("NAMESPACE_ID%3D" + tmpId);

    var url = "http://graymanix.ovh/api/v2/sidm/_table/" + tableName + "?filter=" + filter + "&api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe";

    console.log(url);
    $http.get(url).then(function (response) {
        if (response.status == "200") {
            $scope.names = response.data.resource;
            console.log(response);
        }
    });


    this.addPhoto = function () {
        $location.path("/addPhoto");
    };

    this.delete = function (row) {
        console.log(row);
        var url = "";
        if (photoMode == 1) {
            url = "http://graymanix.ovh/api/v2/sidm/_table/PLACES_PHOTOS?api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe";
        }
        else {
            url = "http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES_PHOTOS?api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe";
        }

        var resource = {
            resource: [
                {
                    ID: row.ID
                }
            ]
        };
        console.log(resource);
        console.log(url);
        $http.post(url, resource, {headers: {'X-HTTP-METHOD': 'DELETE'}})
            .then(function (response) {
                $http.get(url).then(function (response) {
                    if (response.status == "200") {
                        $scope.names = [];
                        $scope.names.length = 0;
                        $scope.names = response.data.resource;
                        console.log(response);
                    }
                });
            }, function (error) {
                console.log(error);
                //TODO
            })
    };

});

var ModalInstanceCtrl = function ($scope, $uibModalInstance) {
    $scope.close = function () {
        $uibModalInstance.close();
    };
};
