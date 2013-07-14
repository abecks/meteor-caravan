// Create minimongo object
Games = new Meteor.Collection("games");

// Subscribe to 'servers' collection on startup.
//var gamesHandle = Meteor.subscribe('games');

Template.games.games = function () {
    return Games.find({}, {sort: {created: 'asc'}});
};

////////// Events //////////
Template.games.events({
    // Delete games
    'click #delete-games': function(e){
        e.preventDefault();
        Meteor.call('deleteGames', function(err){
            if(err) console.log(err);
            alert('All games deleted');
        });
    }
});

