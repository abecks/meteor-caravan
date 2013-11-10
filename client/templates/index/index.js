// Event map for index template
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
        Meteor.call('deleteGames');
    }
});