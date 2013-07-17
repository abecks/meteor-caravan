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
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
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
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
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
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
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
        if(game.player1 == user.username) return 'player1';
        if(game.player2 == user.username) return 'player2';

        var player;
        if(game.player1 == null || typeof game.player1 == 'undefined'){
            player = 'player1';
        }else if(game.player2 == null || typeof game.player2 == 'undefined'){
            player = 'player2';
        }else{
            return false;
        }

        var params = { $set: {} };
        params.$set[player] = user.username;
        Games.update(game._id, params);
        return player;
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

        console.log('target', target);
        console.log('card', card);

        // Make sure its the player's turn
        if(!isTurn(user,game)) return false;

        // Get the player's deck and position
        var player = getSeat(user,game),
            deck = game.decks[player];

        console.log(deck, card.id);

        // Verify the card is in the player's hand
        if(!isCardInHand(deck,card.id)) return false;


        console.log('hit');
        // Find the card in the deck
        card = findCardInDeck(deck,card.id);
        if(!card) return false;


        console.log(typeof target);

        var params;
        // Add to the desired caravan
        if(target === null){
            params = { $push: {} };
            params.$push['caravans.'+caravan+'.'+player+'.cards'] = { id: card.id, suit: card.suit, value: card.value };
        }else{ // Add as modifier card

            console.log('Add as modifier card:', card, 'target:', target);

            // Lookup target card
            var targetCard = false, stack = game.caravans[caravan][target.stack].cards;

            if(typeof target.index == 'number'){

                // Root card
                targetCard = game.caravans[caravan][target.stack].cards[target.index];
                if(!targetCard) return false;

                // Add as modifier to target card
                if(typeof targetCard.modifiers == 'undefined' || targetCard.modifiers == null){
                    targetCard.modifiers = [];
                }
                targetCard.modifiers.splice(0, 0, card); // Add to front of modifiers array

            }else{

                // Modifier card
                var parentCard = game.caravans[caravan][target.stack].cards[target.index[0]];
                targetCard = parentCard.modifiers[target.index[1]];
                if(!targetCard) return false;
                parentCard.modifiers.splice(targetCard.index, 0 , card);

            }

            params = { $set: {} };
            params.$set['caravans.'+caravan+'.'+target.stack+'.cards'] = stack;
        }
        console.log(params);
        Games.update( game._id, params);


        // Calculate caravan value
/*        var faceValue;
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
        Games.update( game._id, params);*/

        // Remove from the player's deck
        deck.splice(card.index, 1);
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
 * Finds a card by id anywhere in a specified caravan stack.
 * @param stack
 * @param target
 * @returns {boolean}
 */
var searchCaravanStack = function(stack, target){
    var card = false;

    for(var i = 0; i < stack.length; i++){
        var cardCursor = stack[i];

        if(cardCursor.id == target){ // Root level card

            card = cardCursor;
            card.index = i;

        }else{ // Search in modifiers if the card has any

            if(typeof cardCursor.modifiers !== 'undefined' && cardCursor.modifiers !== null){
                for(var x = 0; x < cardCursor.modifiers.length; x++){
                    var modifierCursor = cardCursor.modifiers[x];

                    if(modifierCursor.id == target){
                        card = modifierCursor;
                        card.index = x;
                        card.modifier = true;
                        card.parent = cardCursor.id;
                    }

                }
            }
        }
    }

    console.log('search result:', card);

    return card;
};

/**
 * Generates a new game deck.
 * @returns {*}
 */
var generateDeck = function(){
    var deck = defaultDeck.slice(0),
        deck = shuffle(deck);

    // Give each card a unique ID in the deck
    for(var i = 0; i < deck.length; i++){
        deck[i].id = Meteor.uuid();
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
 * @param game
 * @param deck
 * @param card
 * @returns {*}
 */
var isCardInHand = function(deck,card){
    // Hand is the first eight cards
    var hand = deck.slice(0);
    hand = hand.splice(0,8);

    // Make sure the desired playing card is in the hand
    var present = false;
    for(var i = 0; i < hand.length; i++){
        if(hand[i].id == card){
            present = true;
            break;
        }
    }
    return present;
};

var randomCaravanDestination = function(){
    return shuffle(caravanDestinations.slice(0))[0];
};

var caravanDestinations = [
    'Andale', 'Arefu', 'Big Town', 'Citadel', 'Evergreen Mills', 'Girdershade', 'Grayditch', 'Little Lamplight', 'Megaton', 'Paradise Falls', 'Rivet City', 'Tenpenny Tower', // Fallout 3
    'Boulder City', 'Hoover Dam', 'Goodsprings', 'Jacobstown', 'Nipton', 'Novac', 'Primm' // New Vegas
];