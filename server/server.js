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
                player1: user.username,
                player2: null,
                created: (new Date()).getTime(),
                caravans: [
                    {
                        'player1': {
                            value: 0,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            cards: []
                        }
                    },
                    {
                        'player1': {
                            value: 0,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            cards: []
                        }
                    },
                    {
                        'player1': {
                            value: 0,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            cards: []
                        }
                    }
                ],
                decks: {
                    'player1': shuffle(defaultDeck),
                    'player2': shuffle(defaultDeck)
                }
            });
        }else{
            return null;
        }
    },

    // Join a specific match
    seatPlayer: function(matchId){
        // Seat the player
        var game = Games.findOne({ _id: matchId }),
            user = Meteor.users.findOne({ _id: this.userId });

        console.log(game.player1, user.username, game.player2);
        if(game.player1 != user.username && game.player2 == null){
            return Games.update(game._id, {$set: {player2: user.username}});
        }else{
            return false;
        }
    }
});

Meteor.startup(function () {

});

