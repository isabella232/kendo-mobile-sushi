angular.module('sushiMobileApp', [ 'kendo.directives' ])
    .run(['sushiCart', function(sushiCart){
        sushiCart.init();
    }])
    .service('sushiCart', ['$rootScope', function($rootScope) {

        this.init = function() {
            this.added = new kendo.data.ObservableArray([]);
            this.currentItem = null;
            this.productsDataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: "content/menu.json",
                        dataType: "json"
                    }
                }
            });
        };

        this.addToCart = function(kendoEvent, dataItem) {
            var that = this, item, ordered;

            item = dataItem ? dataItem : this.currentItem;

            ordered = item.get("ordered") || 0;
            ordered += 1;

            item.set("ordered", ordered);

            if (ordered === 1) {
                item.set("visibleMessage", true);
                this.added.push(item);
            }

            kendoEvent.preventDefault();
        };

        this.removeItem = function(kendoEvent, dataItem) {
            var item = dataItem,
            index = this.added.indexOf(item),
            currentView = kendo.mobile.application.view();

            item.set("ordered", 0);
            item.set("visibleMessage", false);
            this.added.splice(index, 1);

            currentView.scroller.reset();
            kendoEvent.preventDefault();
        };

        this.checkout = function() {
            var that = this,
            dataSourceData = this.productsDataSource.data(),
            length = dataSourceData.length;

            setTimeout(function () {
                for (idx = 0; idx < length; idx++) {
                    dataSourceData[idx].set("ordered", 0);
                }

                that.added = [];
            }, 400);
        };

        this.showLabel = function() {
            return this.currentItem && this.currentItem.ordered > 0;
        };

        this.showTotal = function() {
            var cartItems = this.added,
            total = 0;
            for(var idx = 0; idx < cartItems.length; idx++) {
                total += cartItems[idx].ordered * cartItems[idx].price;
            }
            return kendo.toString(total, "c");
        };

        this.setCurrentItem = function(id) {
            this.currentItem = this.productsDataSource.get(id);
        };
    }])
    .factory('templates', function() {
        return {
            menuTemplate: $("#menuTemplate").html(),
            cartItemTemplate: $("#cartItemTemplate").html()
        };
    })
    .controller('indexController', ['$scope', 'sushiCart', 'templates', function($scope, sushiCart, templates) {
        $scope.sushiCart = sushiCart;
        $scope.templates = templates;

        $scope.filterFeatured= function() {
            $scope.sushiCart.productsDataSource.group([]);
            $scope.sushiCart.productsDataSource.filter({ field: "featured", operator: "eq", value: true });
        }
    }])
    .controller('menuController', ['$scope', 'sushiCart', 'templates', function($scope, sushiCart, templates) {
        $scope.sushiCart = sushiCart;
        $scope.templates = templates;

        $scope.groupByCategory = function() {
            $scope.sushiCart.productsDataSource.filter([]);
            $scope.sushiCart.productsDataSource.group({ field: "category" });
        }
    }])
    .controller('cartController', ['$scope', 'sushiCart', 'templates', function($scope, sushiCart, templates){
        $scope.sushiCart = sushiCart;
        $scope.templates = templates;
    }])
    .controller('detailsController', ['$scope', 'sushiCart', function($scope, sushiCart){
        $scope.sushiCart = sushiCart;

        $scope.setCurrentItem = function(kendoEvent) {
            var id = parseInt(kendoEvent.view.params.id);
            sushiCart.setCurrentItem(id);
        }
    }]);
