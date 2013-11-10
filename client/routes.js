////////// Routes with Backbone //////////

// Extend backbone router
var AppRouter = Backbone.Router.extend({
    routes: {
        "" : "index",
        "match/:match" : "match",
        ":page" : "page"
    },
    index: function () {
        Session.set('action', 'index');
    },
    match: function(id){
        Session.set('match', id);
        Session.set('action', 'match');
    },
    page: function(page){
        Session.set('action', page);
    }
});

// Create router instance
Router = new AppRouter;

/**
 * Push new URL to history and change session action.
 * @param path
 */
Router.go = function(path){
    this.navigate('/'+path, {trigger: true});

    // Reset window scroll position
    $(window).scrollTop(0);
};

/**
 * Global template helper function to check the current route in a template.
 */
Handlebars.registerHelper('routeIs', function(target){
    return Session.get('action') === target;
});


// Retrieve template for current page
Template.page_controller.current_page = function(){
    var action = Session.get('action');

    // Check template exists
    if(Template[action]){
        return Template[action]();
    }else{
        return Template['404']();
    }
};

Meteor.startup(function () {
    Backbone.history.start({pushState: true});

    // Using jQuery to delegate anchor click events because Meteor cant do it yet
    $('body').on('click', 'a', function(e){
        var $this = $(e.currentTarget);
        // Open external links naturally
        if($this.hasClass('external')) return true;

        // Prevent default behavior
        e.preventDefault();
        e.stopPropagation();

        // Get action from link
        var action = $(e.currentTarget).attr('href');
        action = action.replace('/','');
        Router.go(action);
    });
});