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