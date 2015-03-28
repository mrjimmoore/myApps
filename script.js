// module

var app = angular.module("mainApp", ["ngRoute"]);

// routes

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {templateUrl: "home.html", controller: "homeController"})
        .when("/about", {templateUrl: "about.html", controller: "aboutController"})
        .when("/help", {templateUrl: "help.html", controller: "helpController"})
        .when("/settings", {templateUrl: "settings.html", controller: "settingsController"})
        .when("/addContact", {templateUrl: "contact.html", controller: "contactDetailController"})
        .when("/listContacts", {templateUrl: "contacts.html", controller: "contactListController"})
        .when("/updateContact/:_id", {templateUrl: "contact.html", controller: "contactDetailController"})
        .otherwise({templateUrl: "home.html", controller: "homeController"});

    $locationProvider.html5Mode(true).hashPrefix("!");
});

// factory

app.factory("dataFactory", ["$http", function ($http) {
    var urlBase = "http://localhost:3000/contacts";
    var dataFactory = {};

    dataFactory.getContacts = function () {
        return $http.get(urlBase);
    };

    dataFactory.getContactsSorted = function (sortColumn, sortDescending) {
        return $http.get(urlBase + "/" + sortColumn + "/" + (sortDescending ? "descending" : "ascending"));
    };

    dataFactory.getContact = function (id) {
        return $http.get(urlBase + "/" + id);
    };

    dataFactory.insertContact = function (contact) {
        return $http.post(urlBase, contact);
    };

    dataFactory.updateContact = function (contact) {
        return $http.put(urlBase + "/" + contact._id, contact)
    };

    dataFactory.deleteContact = function (id) {
        return $http.delete(urlBase + "/" + id);
    };

    return dataFactory;
}]);

// controllers

app.controller("mainController", function ($scope, $location) {
    $scope.navbarTitle = "SPA Example";
    $scope.navbarSubTitle = "using the MEAN Stack";
    $scope.copyrightDate = new Date();

    //// alternative to templateUrl by allowing the routeProvider to be loaded via ng-click.
    //$scope.loadView = function (uri) {
    //    $location.path(uri);
    //}
});

app.controller("homeController", function ($rootScope, $scope) {
    $("#headerContent").load("mainHeader.html");
    //$compile($("#headerContent"))($scope);
});

app.controller("aboutController", function ($scope) {
    $("#headerContent").load("mainHeader.html");
});

app.controller("helpController", function ($scope) {
    $("#headerContent").load("mainHeader.html");
});

app.controller("settingsController", function ($scope) {
    $("#headerContent").load("mainHeader.html");
});

app.controller("contactListController", function ($scope, $window, dataFactory) {
    $("#headerContent").load("contactsHeader.html");
    $scope.sortColumn = "fullname";
    $scope.sortDescending = false;
    getContacts();

    function getContacts() {
        dataFactory.getContactsSorted($scope.sortColumn, $scope.sortDescending)
            .success(function (docs) {
                $scope.contacts = docs;
            })
            .error(function (err) {
                alert("Unable to load data: " + err.message);
            });
    }

    $scope.deleteContact = function (index) {
        dataFactory.deleteContact($scope.contacts[index]._id)
            .success(function () {
                getContacts();
            })
            .error(function (err) {
                alert("Unable to delete document: " + err.message);
            });
    };

    $scope.changeSorting = function (columnName) {
        if (columnName == $scope.sortColumn) {
            $scope.sortDescending = !$scope.sortDescending;
        } else {
            $scope.sortColumn = columnName;
            $scope.sortDescending = false;
        }
        getContacts();
    }
});

app.controller("contactDetailController", function ($scope, $routeParams, dataFactory) {
    if ($routeParams._id == null) {
        $scope.sectionTitle = "Add New Contact";
    } else {
        $scope.sectionTitle = "Update Contact";
        getContact($routeParams._id);
    }

    $scope.saveContact = function () {
        if ($scope.contact._id == null) {
            addContact($scope.contact);
        } else {
            updateContact($scope.contact);
        }
    };

    function getContact(id) {
        dataFactory.getContact(id)
            .success(function (doc) {
                $scope.contact = doc;
            })
            .error(function (err) {
                alert("Unable to get document: " + err.message);
            });
    }

    function addContact(contact) {
        dataFactory.insertContact(contact)
            .success(function (doc) {
                $scope.contact = doc;
                $scope.sectionTitle = "Update Contact";
            })
            .error(function (err) {
                alert("Unable to add a contact: " + err.message);
            });
    }

    function updateContact(contact) {
        dataFactory.updateContact(contact)
            .success(function (doc) {
                $scope.contact = doc;
            })
            .error(function (err) {
                alert("Unable to update contact: " + err.message);
            });
    }
});

// directives

// sets initial focus on page load
app.directive("focus", function () {
    return {
        link: function (scope, element, attributes) {
            element[0].focus();
        }
    };
});

// confirmation dialog with custom message
app.directive("jimConfirmClick", function () {
    return {
        priority: -1,
        restrict: "A",
        link: function (scope, element, attributes) {
            element.bind("click", function (event) {
                var message = attributes.jimConfirmClick;
                if (!confirm(message)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            });
        }
    }
});

// inspects each keystroke and inserts text at the point of special key sequences
app.directive("jimHotKeys", function () {
    var lastKeyCode = 0;

    // insert text at cursor of element and remove the 2 character hot key sequence
    function insertAtCursor(element, myValue, event) {
        if (element.selectionStart || element.selectionStart == '0') {
            var startPos = element.selectionStart - 1; // -1 to remove the first hot key character
            var endPos = element.selectionEnd;
            var scrollTop = element.scrollTop;
            element.value = element.value.substring(0, startPos) + myValue + element.value.substring(endPos, element.value.length);
            element.focus();
            element.selectionStart = startPos + myValue.length;
            element.selectionEnd = startPos + myValue.length;
            element.scrollTop = scrollTop;
        } else {
            element.value += myValue;
            element.focus();
        }
        event.preventDefault();
    }

    // evaluate each keystroke
    return {
        link: function (scope, element, attributes) {
            element.on("keypress", function (event) {
                if (lastKeyCode == 47) { // forward slash
                    if (event.keyCode == 70 || event.keyCode == 102) { // F or f
                        lastKeyCode = 0; // set to null
                        insertAtCursor(this, "[/f here]", event);
                    }
                }
                if (!event.shiftKey) lastKeyCode = event.keyCode; // ignore shift key
            })
        }
    }
});