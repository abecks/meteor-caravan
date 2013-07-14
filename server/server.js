/**
 * Server-side methods.
 */
Meteor.methods({

    'deleteGames': function(){
        Games.remove({});
    },

    'deleteUsers': function(){
        Meteor.users.remove({});
    },

    // Find a game for the client, if no game is found, create one
    'joinGame': function(){

    },

    // Create a private game for the client
    'createGame': function(){
        // Get username
        var user = Meteor.users.findOne({ _id: this.userId });
        if(typeof user != 'undefined'){
            return Games.insert({
                players: [user.username],
                created: (new Date()).getTime()
            });
        }else{
            return null;
        }
    }
});

Meteor.startup(function () {

});

