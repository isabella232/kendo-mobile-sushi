(function($, undefined) {
    kendo.data.binders.srcPath = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["srcPath"].get();

            if (value) {
                $(this.element).attr("src", "content/images/200/" + value);
            }
        }
    });

    kendo.data.binders.format = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["format"].get();

            if (value) {
                $(this.element).text(kendo.toString(value, "c"));
            }
        }
    });

    kendo.data.binders.innerText = kendo.data.Binder.extend( {
        refresh: function() {
            var value = this.bindings["innerText"].get();

            if (value) {
                $(this.element).text("Item added to cart " + value + " times.");
            }
        }
    });
    
    //viewModel
    var viewModel = kendo.observable({
        dataSource: new kendo.data.DataSource({
            transport: { 
                read: { 
                    url: "content/menu.json", 
                    dataType: "json" 
                } 
            }
        }),
        added: [],
        currentItem: null,
        addToCart: addToCart,
        removeItem: removeItem,
        checkout: checkout,
        showCheckout: showCheckout
    });

    function showHomeView(e) {
        viewModel.dataSource.group([]);
        $("#featured").data("kendoMobileListView").options.type = "flat";
        viewModel.dataSource.filter({ field: "featured", operator: "eq", value: true});
    }

    function showMenuView() {
        viewModel.dataSource.filter([]);
        viewModel.dataSource.group({field: "category"});
    }

    function addToCart(e) {
        var item = e.data,
            ordered = item.get("ordered") || 0;

        ordered += 1;

        item.set("ordered", ordered);

        if (ordered === 1) {
            this.added.push(item);
        }

        e.preventDefault();
    }

    function removeItem(e) {
        
    }

    function checkout(e) {
        
    }

    function showCheckout(e) {

    }

    var ds = new kendo.data.DataSource({
        transport: { 
            read: { 
                url: "content/menu.json", 
                dataType: "json" 
            } 
        }
    });

    //home view model
    var homeViewModel = kendo.observable({
        featured: [],
        addToCart: addToCart,
        init: function() {
            var that = this;

            ds.one("change", function() {
                that.set("featured", this.view());
            })
            .filter({ field: "featured", operator: "eq", value: true});
        }
    });

    //menu view model
    var menuViewModel = kendo.observable({
        all: new kendo.data.DataSource({
            group: "category"
        }),
        addToCart: addToCart,
        init: function() {
            var that = this;
            ds.one("change", function() {
                that.all.data(this.data().toJSON());
            }).fetch();
        }
    });



    //cart view model
    var cartViewModel = kendo.observable({
        added: new kendo.data.DataSource(),
        removeItem: function(e) {
            var item = e.data,
                currentView = app.view(),
                featured = homeViewModel.get("featured"), //observable array
                all = menuViewModel.all; //dataSource instance

            //reset ordered numver in cart list
            item.set("ordered", 0);
            this.added.remove(item);

            //reset ordered number in featured list
            for(var i = 0; i < featured.length; i++) {
                if(featured[i].id === item.id) {
                    featured[i].set("ordered", 0);
                }
            }

            //reset ordered numver in list of all products
            all.get(item.id).set("ordered", 0);

            currentView.scroller.reset();
            e.preventDefault();
        },
        checkout: function() {
            var dataSource = this.added,
                items = dataSource.data(),
                length = items.length,
                idx = 0;

            setTimeout(function () {
                for (; idx < length; idx++) {
                    items[0].set("ordered", 0);
                }

                dataSource.data([])
            }, 400);
        },
        showCheckout: function() {
            var button = $("#checkout");

            if (this.added.data()[0]) {
                button.show();
            } else {
                button.hide();
            }
        }
    });

    //detail view model
    var detailViewModel = kendo.observable({
        currentItem: null,
        addToCart: function(e) {
            var item = this.currentItem,
                ordered = item.get("ordered") || 0;

            ordered += 1;

            item.set("ordered", ordered);

            if (ordered === 1) {
                cartViewModel.added.add(item.toJSON());
            }

            e.preventDefault();
        },
        showLabel: function() {
            return this.get("currentItem") && this.get("currentItem").get("ordered") > 0;
        }
    });

    function initHomeView() {
        homeViewModel.init();
    }

    function initMenuView() {
        menuViewModel.init();
    }

    function showCartView() {
        cartViewModel.showCheckout();
    }

    function showDetailsView(e) {
        var view = e.view;

        ds.fetch(function() {
            var model = view.model,
                item = ds.get(view.params.id);

            model.set("currentItem", item);
        });
    }

    $.extend(window, {
        homeViewModel: homeViewModel,
        menuViewModel: menuViewModel,
        cartViewModel: cartViewModel,
        detailViewModel: detailViewModel,
        showHomeView: showHomeView,
        showMenuView: showMenuView,
        showCartView: showCartView,
        showDetailsView: showDetailsView,
        viewModel: viewModel 
    });
})(jQuery);
