//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', 'ngComponentRouter', 'credit-cards', 'pascalprecht.translate', 'ngSanitize', 'storefrontApp'])

.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useUrlLoader(BASE_URL + 'themes/localization.json');
    $translateProvider.preferredLanguage('en');
}])

.run(['$templateCache', function ($templateCache) {
    // cache application level templates
    $templateCache.put('pagerTemplate.html', '<uib-pagination boundary-links="true" max-size="$ctrl.pageSettings.numPages" items-per-page="$ctrl.pageSettings.itemsPerPageCount" total-items="$ctrl.pageSettings.totalItems" ng-model="$ctrl.pageSettings.currentPage" ng-change="$ctrl.pageSettings.pageChanged()" class="pagination-sm" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></uib-pagination>');
}])

.value('$routerRootComponent', 'vcAccountManager')

.component('vcAccountManager', {
    templateUrl: "account-manager.tpl",
    bindings: {
        baseUrl: '<',
        customer: '<'
    },
    $routeConfig: [
         { path: '/orders/...', name: 'Orders', component: 'vcAccountOrders'},
         { path: '/subscriptions/...', name: 'Subscriptions', component: 'vcAccountSubscriptions' },
         { path: '/quotes', name: 'Quotes', component: 'vcAccountQuotes' },
         { path: '/profile', name: 'Profile', component: 'vcAccountProfileUpdate', useAsDefault: true },
         { path: '/addresses', name: 'Addresses', component: 'vcAccountAddresses' },
         { path: '/changePassword', name: 'PasswordChange', component: 'vcAccountPasswordChange' },
         { path: '/lists/...', name: 'Lists', component: 'vcAccountLists' }
    ],
    controller: ['storefront.accountApi', 'storefrontApp.mainContext', 'loadingIndicatorService', function (accountApi, mainContext, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.getQuotes = function (pageNumber, pageSize, sortInfos, callback) {
            loader.wrapLoading(function () {
                return accountApi.searchQuotes({ pageNumber: pageNumber, pageSize: pageSize }, callback).$promise;
            });
        };

        $ctrl.updateProfile = function (updateRequest) {
            loader.wrapLoading(function () {
                return accountApi.updateAccount(updateRequest, mainContext.getCustomer).$promise;
            });
        };

        $ctrl.updateAddresses = function (data) {
            return loader.wrapLoading(function () {
                return accountApi.updateAddresses(data, mainContext.getCustomer).$promise;
            });
        };

        $ctrl.availCountries = accountApi.getCountries();

        $ctrl.getCountryRegions = function (country) {
            return accountApi.getCountryRegions(country).$promise;
        };

        $ctrl.changePassword = function (changePasswordData) {
            return loader.wrapLoading(function () {
                return accountApi.changePassword(changePasswordData).$promise;
            });
        };

        $ctrl.deletePhoneNumber = function () {
            return accountApi.deletePhoneNumber().$promise;
        };

        $ctrl.changeTwoFactorAuth = function (enabled) {
            return accountApi.changeTwoFactorAuth({ enabled: enabled }).$promise;
        };

        $ctrl.updatePhoneNumber = function (number) {
            return accountApi.updatePhoneNumber({phoneNumber: number}).$promise;
        };
    }]
})

.service('confirmService', ['$q', function ($q) {
    this.confirm = function (message) {
        return $q.when(window.confirm(message || 'Is it OK?'));
    };
}])

.factory('loadingIndicatorService', function () {
    var retVal = {
        isLoading: false,
        wrapLoading: function (func) {
            retVal.isLoading = true;
            return func().then(function (result) {
                retVal.isLoading = false;
                return result;
            },
            function () { retVal.isLoading = false; });
        }
    };

    return retVal;
});
