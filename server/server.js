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
                    'player1': [
                        {
                            suit: 'hearts',
                            value: 2
                        },
                        {
                            suit: 'spades',
                            value: 5
                        }
                    ],
                    'player2': []
                }
            });
        }else{
            return null;
        }
    }
});

Meteor.startup(function () {

});

