// Create collection
Messages = new Meteor.Collection("messages");

// Access rules
Messages.deny({
    insert: function(userId, game){
        return true;
    },
    update: function(userId, game){
        return true;
    },
    remove: function(userId, game){
        return true;
    }
});

// Publish messages for the user's game only
Meteor.publish('messages', function (gameId) {

    if(this.userId === null) return null;

    var user = Meteor.users.findOne({ _id : this.userId });
    if(user === null) return false;

    var game = Games.find({ _id: gameId, $or: [ { player1: user.username }, { player2: user.username } ] });
    if(game === null) return false;

    return Messages.find({ game: gameId });
});