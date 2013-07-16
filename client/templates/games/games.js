// Create minimongo objects
Games = new Meteor.Collection("games");

// Subscribe to games if we're on that action
Deps.autorun(function(){
    if(Session.get('action') == 'games'){
        var gamesHandler = Meteor.subscribe('games');
    }
});

Template.games.games = function () {
    return Games.find({}, {sort: {created: 'asc'}});
};

////////// Events //////////
Template.games.events({
    // Delete games
    'click #delete-games': function(e){
        e.preventDefault();
        Meteor.call('deleteGames');
    }
});

