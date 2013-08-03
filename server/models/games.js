// Create collections
Games = new Meteor.Collection("games");
Moves = new Meteor.Collection("moves");

// Access rules - deny all client modifications
Games.deny({
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

Moves.deny({
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

    // Determine the user's seat
    var game = Games.findOne({ _id: matchId }),
        user = Meteor.users.findOne({ _id: this.userId }),
        fields = {};

    if(typeof game == 'undefined') return false;

    if(game.player1 == user.username){
        fields['decks.player2'] = 0;
    }else{
        fields['decks.player1'] = 0;
    }

    // Return cursor for client
    return Games.find({ _id: matchId });
});

// Publish the moves for the user's match
Meteor.publish('moves', function(gameId){
    if(this.userId === null) return null;

    var user = Meteor.users.findOne({ _id : this.userId });
    if(typeof user == 'undefined') return false;

    var game = Games.find({ _id: gameId, $or: [ { player1: user.username }, { player2: user.username } ] });
    if(typeof game == 'undefined') return false;

    return Moves.find({ game: gameId });
});