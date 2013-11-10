// Create minimongo objects
Games = new Meteor.Collection("games");

Template.games.created = function(){
	// Subscribe to the games collection when this template is instanced
	this.gamesHandler = Meteor.subscribe('games');
}

Template.games.destroyed = function(){
	// Unsubscribe from the games collection when this template is destroyed
	this.gamesHandler.stop();
}

// Template helper to list games
Template.games.games = function () {
    return Games.find({}, {sort: {created: 1}});
};

// Template event map
Template.games.events({
    // Delete all games
    'click #delete-games': function (e) {
        e.preventDefault();
        Meteor.call('deleteGames');
    }
});

