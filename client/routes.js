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
    match: function(match){
        Session.set('match', match);
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
 * @param action
 */
Router.go = function(action){
    this.navigate('/'+action);

    if(action == ""){
        action = 'index';
    }

    /*
    Changing the action will change the page_controller template automagically
    thanks to how awesome Meteor is. (Its actually called a reactive template).
     */
    Session.set('action', action);
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