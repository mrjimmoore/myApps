// module

var app = angular.module('mainApp', ['ngRoute']);

// routes

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {templateUrl: 'home.html', controller: 'homeController'})
        .when('/about', {templateUrl: 'about.html', controller: 'aboutController'})
        .when('/help', {templateUrl: 'help.html', controller: 'helpController'})
        .when('/addContact', {templateUrl: 'contact.html', controller: 'contactDetailController'})
        .when('/listContacts', {templateUrl: 'contacts.html', controller: 'contactListController'})
        .when('/updateContact/:_id', {templateUrl: 'contact.html', controller: 'contactDetailController'})
        .otherwise({templateUrl: 'home.html', controller: 'homeController'});

    $locationProvider.html5Mode(true).hashPrefix('!');
});

// factory

app.factory('dataFactory', ['$http', function ($http) {

    var urlBase = 'http://localhost:3000/contacts';
    var dataFactory = {};

    dataFactory.getContacts = function () {
        return $http.get(urlBase);
    };

    dataFactory.getContact = function (id) {
        return $http.get(urlBase + '/' + id);
    };

    dataFactory.insertContact = function (contact) {
        return $http.post(urlBase, contact);
    };

    dataFactory.updateContact = function (contact) {
        return $http.put(urlBase + '/' + contact._id, contact)
    };

    dataFactory.deleteContact = function (id) {
        return $http.delete(urlBase + '/' + id);
    };

    return dataFactory;
}]);

// controllers

app.controller('mainController', function ($scope) {
    $scope.bannerTitle = 'SPA Example';
    $scope.bannerSubTitle = 'using the MEAN Stack';
    $scope.headerTitle = 'Contacts';
    $scope.headerMessage = 'Morbi ullamcorper auctor convallis quam turpis molestie eget sem, leo cras velit lacus vulputate imperdiet molestie, gravida suscipit facilisis sagittis per fusce ante.';
    $scope.copyrightDate = new Date();
});

app.controller('homeController', function ($scope) {
    $scope.message = 'Home page message...';
});

app.controller('aboutController', function ($scope) {
    $scope.message = 'About page message...';
});

app.controller('helpController', function ($scope) {
    $scope.message = 'Help page message...';
});

app.controller('contactListController', function ($scope, $window, dataFactory) {
    getContacts();

    function getContacts() {
        dataFactory.getContacts()
            .success(function (docs) {
                $scope.contacts = docs;
            })
            .error(function (err) {
                alert('Unable to load data: ' + err.message);
            });
    }

    $scope.deleteContact = function (index) {
        var confirmation = $window.confirm('Delete ' + $scope.contacts[index].fullname + '?');
        if (confirmation) {
            dataFactory.deleteContact($scope.contacts[index]._id)
                .success(function () {
                    getContacts();
                })
                .error(function (err) {
                    alert('Unable to delete document: ' + err.message);
                });
        }
    };
});

app.controller('contactDetailController', function ($scope, $routeParams, dataFactory) {
    if ($routeParams._id == null) {
        $scope.message = 'Add New Contact';
    } else {
        $scope.message = 'Update Contact';
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
                alert('Unable to get document: ' + err.message);
            });
    }

    function addContact(contact) {
        dataFactory.insertContact(contact)
            .success(function (doc) {
                $scope.contact = doc;
            })
            .error(function (err) {
                alert('Unable to add a contact: ' + err.message);
            });
    }

    function updateContact(contact) {
        dataFactory.updateContact(contact)
            .success(function (doc) {
                $scope.contact = doc;
            })
            .error(function (err) {
                alert('Unable to update contact: ' + err.message);
            })
    }
});