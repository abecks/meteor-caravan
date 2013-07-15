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
        var game = Games.findOne({ $or: [ {player1: null}, {player2: null}] });
        if(typeof game != 'undefined'){
            return game._id;
        }else{
            return false;
        }
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
                    'player1': generateDeck(),
                    'player2': generateDeck()
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

        if(game.player1 != user.username && game.player2 == null){
            return Games.update(game._id, {$set: {player2: user.username}});
        }else{
            return false;
        }
    },


    playCard: function(match,caravan,suit,value){
        var user = Meteor.users.findOne({ _id: this.userId }),
            game = Games.findOne({ _id: match });

        // Get player's deck
        var deck, player;
        if(game.player1 == user.username){
            deck = game.decks.player1;
            player = 'player1';
        }else if(game.player2 == user.username){
            deck = game.decks.player2;
            player = 'player2';
        }else{
            return false;
        }

        // Hand is the first eight cards
        var hand = deck.slice(0);
        hand = hand.splice(0,8);

        // Make sure the desired playing card is in the hand
        var exists = false, cardIndex;
        for(var i = 0; i < hand.length; i++){
            if(hand[i].suit == suit && hand[i].value == value){
                exists = true;
                cardIndex = i;
                break;
            }

        }
        if(!exists) return false;

        // Add to the desired caravan
        var params = { $push: {} };
        params.$push['caravans.'+caravan+'.'+player+'.cards'] = { suit: suit, value: value };
        Games.update( game._id, params);

        // Calculate caravan value
        var faceValue;
        switch(value){
            case 'jack':
            case 'queen':
            case 'king':
                faceValue = 10;
                break;
            case 'ace':
                faceValue = 1;
                break;
            default:
                faceValue = value;
        }

        var caravanValue = parseInt(game.caravans[caravan][player].value) + parseInt(faceValue);
        params = { $set: {} };
        params.$set['caravans.'+caravan+'.'+player+'.value'] = caravanValue;
        Games.update( game._id, params);

        // Remove from the player's deck
        deck.splice(cardIndex,1);
        params = { $set: {} };
        params.$set['decks.'+player] = deck;
        Games.update( game._id, params);

        return true;
    }
});

Meteor.startup(function () {

});

var generateDeck = function(){
    var deck = shuffle(defaultDeck);

    for(var i = 0; i < deck.length; i++){
        deck.id = Meteor.uuid();
    }

    return deck;
};