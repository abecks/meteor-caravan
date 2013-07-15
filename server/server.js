/**
 * Server-side methods.
 */
Meteor.methods({

    /**
     * Maintenance, delete all games.
     */
    'deleteGames': function(){
        if(isAdmin)
            Games.remove({});
    },

    /**
     * Maintenance, delete all users.
     */
    'deleteUsers': function(){
        if(isAdmin)
            Meteor.users.remove({});
    },

    /**
     * Find a game for the client, if no game is found, create one.
     * @returns {*}
     */
    'joinGame': function(){
        // todo: only search public games
        var game = Games.findOne({ $or: [ {player1: null}, {player2: null}] });
        if(typeof game != 'undefined'){
            return game._id;
        }else{
            // todo: create a public game for the user
            return false;
        }
    },

    /**
     * Creates a new private game.
     * @returns {*}
     */
    'createGame': function(){
        // Get username
        var user = Meteor.users.findOne({ _id: this.userId });
        if(typeof user != 'undefined'){
            return Games.insert({
                player1: user.username,
                player2: null,
                created: (new Date()).getTime(),
                turn: 'player1',
                'public': false,
                moves: [],
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

    /**
     * Joins the specified match.
     * @param matchId
     * @returns {*}
     */
    seatPlayer: function(matchId){
        // Seat the player
        var game = Games.findOne({ _id: matchId }),
            user = Meteor.users.findOne({ _id: this.userId });

        // Make sure user isn't already seated
        if(game.player1 == user.username || game.player2 == user.username) return false;

        var player;
        if(game.player1 == null || typeof game.player1 == 'undefined'){
            player = 'player1';
        }else if(game.player2 == null || typeof game.player2 == 'undefined'){
            player = 'player2';
        }else{
            // todo: eject the player because the match is full (or allow spectators?)
            return false;
        }

        var params = { $set: {} };
        params.$set[player] = user.username;
        return Games.update(game._id, params);
    },


    /**
     * Plays the specified card.
     * @param match
     * @param caravan
     * @param card
     * @param target
     * @returns {boolean}
     */
    playCard: function(match,caravan,card,target){
        var user = Meteor.users.findOne({ _id: this.userId }),
            game = Games.findOne({ _id: match });

        // Make sure its the player's turn
        if(!isTurn(user,game)) return false;

        // Get the player's deck and position
        var player = getSeat(user,game),
            deck = game.decks[player];

        // Make sure the card is in the player's current hand
        var cardIndex = cardInHand(game,deck,card);
        if(!cardIndex) return false;

        // Add to the desired caravan
        var params = { $push: {} };
        params.$push['caravans.'+caravan+'.'+player+'.cards'] = { suit: card.suit, value: card.value };
        Games.update( game._id, params);

        // Calculate caravan value
        var faceValue;
        switch(card.value){
            case 'jack':
            case 'queen':
            case 'king':
                faceValue = 10;
                break;
            case 'ace':
                faceValue = 1;
                break;
            default:
                faceValue = card.value;
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

        // Add move
        Games.update( game._id, {$push: { moves: {
            player: player,
            card: card,
            target: target,
            caravan: caravan
        }}});

        // Change turn
        Games.update( game._id, {$set: {turn: (game.turn == 'player1') ? 'player2' : 'player1'}});

        return true;
    }
});

Meteor.startup(function () {

});

/**
 * Generates a new game deck.
 * @returns {*}
 */
var generateDeck = function(){
    var deck = shuffle(defaultDeck);

    // Give each card a unique ID in the deck
    for(var i = 0; i < deck.length; i++){
        deck.id = Meteor.uuid();
    }

    return deck;
};

/**
 * Checks to see if the specified user is an admin.
 * @param userId
 * @returns {boolean}
 */
var isAdmin = function(userId){
    var user = Meteor.users.findOne({ _id: userId });
    return user.username == 'admin';
};

/**
 * Verifies the card is in the player's hand.
 * If the card is present, turns the card's index in the deck.
 * If the card is not present, returns false.
 * @param game
 * @param deck
 * @param card
 * @returns {*}
 */
var cardInHand = function(game,deck,card){
    // Hand is the first eight cards
    var hand = deck.slice(0);
    hand = hand.splice(0,8);

    // Make sure the desired playing card is in the hand
    var cardIndex;
    for(var i = 0; i < hand.length; i++){
        if(hand[i].suit == card.suit && hand[i].value == card.value){
            cardIndex = i;
            break;
        }
    }

    return cardIndex;
};