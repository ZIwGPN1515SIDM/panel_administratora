var app = angular.module('app', ['ui.bootstrap', 'components', "ngRoute", "ngCookies", "ngMap", "ngMaterial", "ngAnimate"]);

var categoryList = [];
var areaList = [];
var tmpId = -1;
var placeMode = -1; //1 - PLACE, 2 - NAMESPACE
var tmpObj = {};
//Konfiguracja widoków
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "view/placeList.htm"
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
        .when("/commentsList", {
            templateUrl: "view/commentsList.htm"
        })
        .when("/namespaceStatistics", {
            templateUrl: "view/namespaceStatistics.htm"
        })
        .when("/placeStatistics", {
            templateUrl: "view/placeStatistics.htm"
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
                    $cookies.put("session_token", response.data.session_token);
                    $cookies.put("userid", response.data.USERSID);
                    $location.path("/");
                } else {
                    $cookies.put("session_token", response.data.session_token);
                    $cookies.put("userid", response.data.USERSID);
                    $location.path("/license");
                }
            }, function (error) {
                openError();
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
        $http.post("http://graymanix.ovh/api/v2/register?api_key=bf980aeea5db5fb03ddafb29a4375d2497b91d81ac836a030abfef9a5573e994", JSON.stringify(tmp)).then(function (response) {
            if (response.status == "200") {
                $location.path("/registerSuccess");
            }
        }, function (error) {
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

app.controller('NamespaceTableController', function ($scope, $http, $location, $cookies) {

    $http.get("http://graymanix.ovh/api/v2/panel/namespace?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff", {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.names = response.data.resource;
            }
        }, function (error) {
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
        placeMode = 2;
        $location.path("/photoList");
    };

    this.edit = function (namespace) {
        tmpObj = namespace;
        $location.path("/editNamespace");
    };

    this.showNamespaceComments = function (namespace) {
        tmpId = namespace.ID;
        placeMode = 2;
        $location.path("/commentsList");
    };

    this.statistics = function (namespace) {
        tmpId = namespace.ID;
        tmpObj = namespace;
        placeMode = 2;
        $location.path("/namespaceStatistics");
    }
});

app.controller('PlaceTableController', function ($scope, $http, $location, $cookies) {

    $http.get("http://graymanix.ovh/api/v2/panel/place?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
        {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.names = response.data.resource;
            }
        }, function (error) {
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
        placeMode = 1;
        $location.path("/photoList");
    };

    this.edit = function (place) {
        tmpObj = place;
        $location.path("/editPlace");
    };

    this.showPlaceComments = function (place) {
        tmpId = place.ID;
        placeMode = 1;
        $location.path("/commentsList");
    };

    this.statistics = function (place) {
        tmpId = place.ID;
        tmpObj = place;
        placeMode = 1;
        $location.path("/placeStatistics");
    }
});

app.controller('LicenseController', function ($scope, $http, $location, $cookies) {
    this.activateLicense = function (key) {
        var req = {
            resource: [
                {
                    CODE: key,
                    USERSID: $cookies.get("userid")
                }
            ]
        };
        $http.post("http://graymanix.ovh/api/v2/license/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
            req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
            .then(function (response) {
                if (response.status == "200") {
                    $location.path("/");
                }
            }, function (error) {
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });

        //$location.path("/");
    }
});

app.controller('AddPlaceController', function ($scope, $http, $location, $cookies) {


    $scope.areas = areaList;

    $http.get("http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES?fields=ID%2C%20NAME&api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe").then(function (response) {
        if (response.status == "200") {
            areaList.length = 0;
            areaList.push("-- Wybierz obszar --");
            $scope.addPlaceForm.placeArea = "-- Wybierz obszar --";
            angular.forEach(response.data.resource, function (value, key) {
                areaList.push(value.ID + ". " + value.NAME);
            });
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

            $http.post("http://graymanix.ovh/api/v2/panel/place/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
                req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
                .then(function (response) {
                    if (response.status == "200") {
                        $location.path("/placeList");
                    }
                }, function (error) {
                    if (error.status == "401" || error.status == "403") {
                        $cookies.remove("session_token");
                        $cookies.remove("userid");
                        $location.path("/login");
                    }
                });
        } else {
            //TODO
        }
    };

    this.back = function () {
        $location.path("/placeList");
    }

});

app.controller('AddNamespaceController', function ($scope, $http, $location, $cookies, $uibModal, $timeout, NgMap) {

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

            $http.post("http://graymanix.ovh/api/v2/panel/namespace/add?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
                req, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
                .then(function (response) {
                    if (response.status == "200") {
                        $location.path("/placeList");
                    }
                }, function (error) {
                    if (error.status == "401" || error.status == "403") {
                        $cookies.remove("session_token");
                        $cookies.remove("userid");
                        $location.path("/login");
                    }
                });
        } else {
            //TODO
        }
    };

    NgMap.getMap().then(function (map) {
        vm.map = map;
        var center = vm.map.getCenter();
        google.maps.event.trigger(vm.map, 'resize');
        vm.map.setCenter(center);
    });

    this.placeMarker = function (e) {
        var tmp = e.latLng;
        latitude.value = tmp.lat();
        longitude.value = tmp.lng();
        lat = tmp.lat();
        lng = tmp.lng();
    }

    this.back = function () {
        $location.path("/placeList");
    }
});

app.controller('AddPhotoController', function ($scope, $http, $location, $cookies) {

    this.addPhoto = function (link) {
        var payload = {};
        var url = "";
        if (placeMode == 1) {
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
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });
    };

    this.back = function () {
        $location.path("/photoList");
    };

});

app.controller('PhotoListController', function ($scope, $http, $location, $cookies) {

    var tableName = placeMode == 1 ? "PLACES_PHOTOS" : "NAMESPACES_PHOTOS";
    var filter = placeMode == 1 ? ("PLACE_ID%3D" + tmpId) : ("NAMESPACE_ID%3D" + tmpId);

    var url = "http://graymanix.ovh/api/v2/sidm/_table/" + tableName + "?filter=" + filter + "&api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe";

    $http.get(url, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.names = response.data.resource;
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });


    this.addPhoto = function () {
        $location.path("/addPhoto");
    };

    this.delete = function (row) {
        var resource = {
            resource: [
                {
                    ID: row.ID
                }
            ]
        };

        $http.post(url, resource, {headers: {'X-HTTP-METHOD': 'DELETE'}})
            .then(function (response) {
                $http.get(url).then(function (response) {
                    if (response.status == "200") {
                        $scope.names = [];
                        $scope.names.length = 0;
                        $scope.names = response.data.resource;
                    }
                });
            }, function (error) {
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            })
    };

    this.back = function () {
        $location.path("/placeList");
    }

});

app.controller('EditNamespaceController', function ($scope, $http, $location, $cookies, NgMap) {

    var vm = this;
    var lng = tmpObj.LONGITUDE, lat = tmpObj.LATITUDE;
    $scope.categories = categoryList;

    $http.get("http://graymanix.ovh/api/v2/category?api_key=be503ed4e9249384e58aad5d34ba46acbad352350b19050b7410ea1049dbef77").then(function (response) {
        if (response.status == "200") {
            categoryList.length = 0;
            var count = 0;
            var cat = "";
            angular.forEach(response.data.categories, function (value, key) {
                categoryList.push(value.ID + ". " + value.NAME);
                if (value.ID == tmpObj.CATEGORY_ID) {
                    cat = value.ID + ". " + value.NAME;
                }
                count++;
            });
            $scope.namespace = {
                placeDescription: tmpObj.DESCRIPTION,
                placeName: tmpObj.NAME,
                placeCategory: cat,
                longitude: tmpObj.LONGITUDE,
                latitude: tmpObj.LATITUDE,
                advertContent: tmpObj.ADVERT,
                eventName: tmpObj.EVENT_NAME,
                eventContent: tmpObj.EVENT_CONTENT,
                eventEnd: new Date(tmpObj.EVENT_END)
            };
        }
    }, function (error) {
        if (error.status == "401" || error.status == "403") {
            $cookies.remove("session_token");
            $cookies.remove("userid");
            $location.path("/login");
        }
    });

    this.editNamespace = function () {
        var req = {
            resource: [
                {
                    ID: tmpObj.ID,
                    NAME: placeName.value,
                    DESCRIPTION: placeDescription.value,
                    EVENT_CONTENT: eventContent.value,
                    EVENT_NAME: eventName.value,
                    EVENT_END: eventEnd.value,
                    ADVERT: advertContent.value,
                    LATITUDE: lat,
                    LONGITUDE: lng,
                    CATEGORY_ID: placeCategory.value.substring(7, 8)
                }
            ]
        };

        $http.post("http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
            req, {headers: {'X-HTTP-METHOD': 'PATCH'}})
            .then(function (response) {
                if (response.status == "200") {
                    $location.path("/placeList");
                }
            }, function (error) {
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });

    };

    NgMap.getMap().then(function (map) {
        vm.map = map;
        google.maps.event.trigger(vm.map, 'resize');
        vm.map.setCenter({lat: tmpObj.LATITUDE, lng: tmpObj.LONGITUDE});
        vm.map.setZoom(16);
    });

    this.placeMarker = function (e) {
        var tmp = e.latLng;
        latitude.value = tmp.lat();
        longitude.value = tmp.lng();
        lat = tmp.lat();
        lng = tmp.lng();
    };

    this.back = function () {
        $location.path("/placeList");
    }
});

app.controller('EditPlaceController', function ($scope, $http, $location, $cookies, NgMap) {

    $scope.areas = areaList;

    $http.get("http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES?fields=ID%2C%20NAME&api_key=486bcd2b0b7cc55fbc3c16f1aadf041686d9cf68ce726b55c7c4012bddaab0fe").then(function (response) {
        if (response.status == "200") {
            areaList.length = 0;
            var count = 0;
            var area = "";
            angular.forEach(response.data.resource, function (value, key) {
                areaList.push(value.ID + ". " + value.NAME);
                if (value.ID == tmpObj.NAMESPACE_ID) {
                    area = value.ID + ". " + value.NAME;
                }
                count++;
            });
            $scope.place = {
                placeDescription: tmpObj.DESCRIPTION,
                placeName: tmpObj.NAME,
                placeArea: area,
                advertContent: tmpObj.ADVERT,
                eventName: tmpObj.EVENT_NAME,
                eventContent: tmpObj.EVENT_CONTENT,
                eventEnd: new Date(tmpObj.EVENT_END)
            };
        }
    }, function (error) {
        if (error.status == "401" || error.status == "403") {
            $cookies.remove("session_token");
            $cookies.remove("userid");
            $location.path("/login");
        }
    });

    this.editPlace = function () {
        var req = {
            resource: [
                {
                    ID: tmpObj.ID,
                    NAME: placeName.value,
                    DESCRIPTION: placeDescription.value,
                    EVENT_CONTENT: eventContent.value,
                    EVENT_NAME: eventName.value,
                    EVENT_END: eventEnd.value,
                    ADVERT: advertContent.value,
                    NAMESPACE_ID: placeArea.value.substring(7, 8)
                }
            ]
        };
        $http.post("http://graymanix.ovh/api/v2/sidm/_table/PLACES?api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff",
            req, {headers: {'X-HTTP-METHOD': 'PATCH'}})
            .then(function (response) {
                if (response.status == "200") {
                    $location.path("/placeList");
                }
            }, function (error) {
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });
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

    this.back = function () {
        $location.path("/placeList");
    }
});

app.controller('CommentsListController', function ($scope, $http, $location, $cookies) {

    var url = "";

    if (placeMode == 1) {
        url = "http://graymanix.ovh/api/v2/comments?type=place&id=" + tmpId + "&api_key=be503ed4e9249384e58aad5d34ba46acbad352350b19050b7410ea1049dbef77"
    } else if (placeMode == 2) {
        url = "http://graymanix.ovh/api/v2/comments?type=namespace&id=" + tmpId + "&api_key=be503ed4e9249384e58aad5d34ba46acbad352350b19050b7410ea1049dbef77"
    }

    $http.get(url, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.names = response.data.comments;
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    this.back = function () {
        $location.path("/placeList")
    }
});

app.controller('PlaceStatisticsController', function ($scope, $http, $location, $cookies) {

    $scope.name = tmpObj.NAME;
    var startUrl = "http://graymanix.ovh/api/v2/sidm/_table/PLACES_STATISTICS_";
    var endUrl = "?filter=PLACE_INSTANCE%3D" + tmpObj.INSTANCE + "&api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff";

    $http.get(startUrl + 7 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200" && response.data.resource.length > 0) {
                $scope.seven = {
                    visits: response.data.resource[0].VISITS,
                    sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                    avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                };
            } else {
                $scope.seven = {
                    visits: 0,
                    sumTime: 0,
                    avgTime: 0
                };
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    $http.get(startUrl + 14 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                if (response.status == "200" && response.data.resource.length > 0) {
                    $scope.fourteen = {
                        visits: response.data.resource[0].VISITS,
                        sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                        avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                    };
                } else {
                    $scope.fourteen = {
                        visits: 0,
                        sumTime: 0,
                        avgTime: 0
                    };
                }
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    $http.get(startUrl + 30 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200" && response.data.resource.length > 0) {
                $scope.thirty = {
                    visits: response.data.resource[0].VISITS,
                    sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                    avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                };
            } else {
                $scope.thirty = {
                    visits: 0,
                    sumTime: 0,
                    avgTime: 0
                };
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    this.back = function () {
        $location.path("/placeList");
    }
});

app.controller('NamespaceStatisticsController', function ($scope, $http, $location, $cookies, $uibModal, $window) {

    $scope.name = tmpObj.NAME;
    var startUrl = "http://graymanix.ovh/api/v2/sidm/_table/NAMESPACES_STATISTICS_";
    var endUrl = "?filter=NAMESPACE_INSTANCE%3D" + tmpObj.INSTANCE + "&api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff";

    $http.get(startUrl + 7 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.seven = {
                    visits: response.data.resource[0].VISITS,
                    sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                    avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                };
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    $http.get(startUrl + 14 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.fourteen = {
                    visits: response.data.resource[0].VISITS,
                    sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                    avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                };
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    $http.get(startUrl + 30 + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
        .then(function (response) {
            if (response.status == "200") {
                $scope.thirty = {
                    visits: response.data.resource[0].VISITS,
                    sumTime: (response.data.resource[0].SUM_TIME_SPENT / 60).toFixed(2),
                    avgTime: (response.data.resource[0].AVG_TIME_SPENT / 60).toFixed(2)
                }
            }
        }, function (error) {
            if (error.status == "401" || error.status == "403") {
                $cookies.remove("session_token");
                $cookies.remove("userid");
                $location.path("/login");
            }
        });

    this.generatePdf = function (days) {

        var tmp = days == 7 ? $scope.seven : (days == 14 ? $scope.fourteen : $scope.thirty);
        var startUrl = "http://graymanix.ovh/api/v2/sidm/_table/PLACES_STATISTICS_";
        var endUrl = "?filter=NAMESPACE_INSTANCE%3D" + tmpObj.INSTANCE + "&api_key=672294d58f2e2e7f1c14e83df65a8a59a8658c1eb91633d5c541115f3eac40ff";

        var html = "<html>" +
            "<head></head>" +
            "<body>" +
            "</br></br></br></br>" +
            "<h1 align=\"center\">Szczegółowe statystyki</h1>" +
            "<h3 align=\"center\">" + tmpObj.NAME + "</h3></br>" +
            "</br></br></br></br><ol>" +
            "<li>Statystyki ogólne miejsca </br></br>" +
            "<table align=\"center\" style='border-collapse: collapse; border: 1px solid black; width: 50%;'>" +
            "<th colspan=\"2\">" +
            tmpObj.NAME +
            "</th>" +
            "<tr><td style='border: 1px solid black;'>Ilość odwiedzin</td>" +
            "<td style='border: 1px solid black;'>" +
            tmp.visits +
            "</td></tr>" +
            "<tr><td style='border: 1px solid black;'>Łączny czas pobytów</td>" +
            "<td style='border: 1px solid black;'>" +
            tmp.sumTime +
            " h</td></tr>" +
            "<tr><td style='border: 1px solid black;'>Średni czas pobytu</td>" +
            "<td style='border: 1px solid black;'>" +
            tmp.avgTime +
            " h</td></tr></table></li></br></br>";

        $http.get(startUrl + days + endUrl, {headers: {'x-dreamfactory-session-token': $cookies.get("session_token")}})
            .then(function (response) {
                if (response.status == "200") {
                    html += "<li>Statystyki szczegółowe - miejsca należące do miejsca głównego</br></br>" +
                        "<table align=\"center\" style='border-collapse: collapse; border: 1px solid black; width: 80%;'>" +
                        "<tr>" +
                        "<th></th>" +
                        "<th style='border: 1px solid black;'>Ilość odwiedzin</th>" +
                        "<th style='border: 1px solid black;'>Łączny czas pobytów</th>" +
                        "<th style='border: 1px solid black;'>Średni czas pobytu</th>" +
                        "</tr>";

                    angular.forEach(response.data.resource, function (value, key) {
                        html += "<tr>" +
                            "<td style='border: 1px solid black;'>" + value.NAME + "</td>" +
                            "<td style='border: 1px solid black;'>" + value.VISITS + "</td>" +
                            "<td style='border: 1px solid black;'>" + (value.SUM_TIME_SPENT / 60).toFixed(2) + " h</td>" +
                            "<td style='border: 1px solid black;'>" + (value.AVG_TIME_SPENT / 60).toFixed(2) + " h</td>" +
                            "</tr>";
                    });
                    html += "</table></li></ol></body>";
                    var msg = {
                        html: html,
                        namespaceId: tmpObj.ID
                    };
                    $http.post("http://graymanix.ovh:8080/pdf", JSON.stringify(msg), '')
                        .then(function (response) {
                            $window.open(response.data.url, '_blank');
                        });
                }
            }, function (error) {
                if (error.status == "401" || error.status == "403") {
                    $cookies.remove("session_token");
                    $cookies.remove("userid");
                    $location.path("/login");
                }
            });


    }

    this.back = function () {
        $location.path("/placeList");
    }
});

var ModalInstanceCtrl = function ($scope, $uibModalInstance) {
    $scope.close = function () {
        $uibModalInstance.close();
    };
};
