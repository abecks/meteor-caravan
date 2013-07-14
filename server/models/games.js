// Create collection
Games = new Meteor.Collection("games");

// Access rules
Games.allow({
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

// Publish complete set of lists to all clients.
Meteor.publish('games', function () {
    // Determine if user is admin
    if(this.userId !== null || typeof this.userId != 'undefined'){
        var user = Meteor.users.findOne({ username: 'admin', _id: this.userId });
        if(typeof user != 'undefined'){
            return Games.find();
        }else{
            return null;
        }
    }
});

// Publish the user's match if it has one
Meteor.publish('match', function(matchId){
    if(this.userId === null) return null;

    // Return cursor for client
    return Games.find({ _id: matchId });
});