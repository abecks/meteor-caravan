Session.setDefault('loading', true);

/**
 * Global template helper functions.
 */
// Get current user in a template
Handlebars.registerHelper('user', function(){
    return Meteor.user();
});

// Determine if the app has loaded
Handlebars.registerHelper('isLoading', function(){
    return Session.get('loading');
});

// Determine if user is an admin
Handlebars.registerHelper('isAdmin', function(){
    var user = Meteor.user();
    if(user == null) return false;
    return Meteor.user().username == 'admin';
});

// Render a card
Handlebars.registerHelper("card", function() {
    return Template['card-'+this.suit+'-'+this.value]();
});

Meteor.startup(function(){
    Session.set('loading', false);
});



Template.index.events({
    // Create game
    'click #create-game': function(e){
        e.preventDefault();
        createGame();
    },

    // Join game
    'click #join-game': function(e){
        e.preventDefault();
        joinGame();
    },

    // Delete games
    'click #delete-games': function(e){
        e.preventDefault();
        Meteor.call('deleteGames', function(err){
            if(err) console.log(err);
            alert('All games deleted');
        });
    }
});

/**
 * Creates a new game.
 */
var createGame = function(){
    // Ask the server to create a game
    var game = Meteor.call('createGame', function(err, id){
        if(err) console.log(err);

        Router.go('/match/'+id);
    });
};

/**
 * Joins an existing game.
 */
var joinGame = function(){
    // Ask the server for a game ID
    var game = Meteor.call('joinGame');
};

