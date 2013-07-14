// Create minimongo object
Games = new Meteor.Collection("games");

// Subscribe to 'servers' collection on startup.
var gamesHandle = Meteor.subscribe('games');

Template.games.games = function () {
    return Games.find({}, {sort: {name: 1}});
};

////////// Events //////////
Template.games.events({
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
    var game = Meteor.call('createGame', function(err, data){
        if(err) console.log(err);

        console.log(data);
    });
};

/**
 * Joins an existing game.
 */
var joinGame = function(){
    // Ask the server for a game ID
    var game = Meteor.call('joinGame');
};