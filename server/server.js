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
                winner: false,
                turn: 'player1',
                'public': false,
                moves: [],
                caravans: [
                    {
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
                        sold: false,
                        'player1': {
                            value: 0,
                            direction: null,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            direction: null,
                            cards: []
                        }
                    },
                    {
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
                        sold: false,
                        'player1': {
                            value: 0,
                            direction: null,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            direction: null,
                            cards: []
                        }
                    },
                    {
                        from: randomCaravanDestination(),
                        to: randomCaravanDestination(),
                        sold: false,
                        'player1': {
                            value: 0,
                            direction: null,
                            cards: []
                        },

                        'player2': {
                            value: 0,
                            direction: null,
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

        // Make sure its the player's turn
        if(!isTurn(user,game)) return false;

        // Get the player's deck and position
        var player = getSeat(user,game),
            deck = game.decks[player];

        // Verify the card is in the player's hand
        if(!isCardInHand(deck,card.id)) return false;

        // Find the card in the deck
        card = findCardInDeck(deck,card.id);
        if(!card) return false;

        // Verify the move is legal
        if(!isLegalMove(game.caravans[caravan][player], card, target)) return false;

        // Stack direction switching for regular cards
        switch(card.suit){
            case 'king':
            case 'jack':
            case 'queen':
                break;

            default:

                // Stack direction switching
                var stack = game.caravans[caravan][player],
                    lastCardInStack = stack.cards[stack.cards.length-1];

                if(typeof lastCardInStack !== 'undefined'){

                    // If the card is contrary to the direction and is the same suit, changes the direction, the same number clears the direction
                    if(card.suit == lastCardInStack.suit){
                        if(stack.direction == 'asc' && card.value < lastCardInStack.value){
                            stack.direction = 'desc';
                        }else if(stack.direction == 'desc' && card.value > lastCardInStack.value){
                            stack.direction = 'asc';
                        }
                    }

                    if(stack.direction == null){

                        // Set the direction for the first time
                        if(card.value > lastCardInStack.value){
                            stack.direction = 'asc';
                        }else if(card.value < lastCardInStack.value){
                            stack.direction = 'desc';
                        }

                    }
                }
                break;
        }

        var params;
        // Add to the desired caravan
        if(target === null){

            game.caravans[caravan][player].cards.push({ id: card.id, suit: card.suit, value: card.value });

        }else{ // Add as modifier card


            // Lookup target card
            var targetCard = false;
            if(typeof target.index == 'number'){ // Root card targetted
                targetCard = game.caravans[caravan][target.stack].cards[target.index];

            }else{ // Modifier card targetted
                var parentCard = game.caravans[caravan][target.stack].cards[target.index[0]];
                targetCard = parentCard.modifiers[target.index[1]];
            }

            switch(card.value){
                case 'king':

                    // Add as modifier to target card
                    if(typeof target.index == 'number'){ // Root card
                        if(typeof targetCard.modifiers == 'undefined' || targetCard.modifiers == null){
                            targetCard.modifiers = [];
                        }
                        targetCard.modifiers.splice(0, 0, card); // Add to front of modifiers array
                    }else{ // Add to modifier chain
                        if(!targetCard) return false;
                        parentCard.modifiers.splice(targetCard.index, 0 , card);
                    }

                    break;

                case 'jack':

                    // Remove card
                    if(typeof target.index == 'number'){ // Root card
                        game.caravans[caravan][target.stack].cards.splice(target.index, 1);
                    }else{ // Modifier card
                        parentCard.modifiers.splice(target.index[1], 1);
                    }

                    break;

                case 'queen':

                    // Change direction of stack
                    var direction = game.caravans[caravan][target.stack].direction;
                    if(direction == 'asc'){
                        direction = 'desc';
                    }else{
                        direction = 'asc';
                    }

                    break;

                default:
                    return false;
            }
        }


        // Re-calculate caravan value
        game.caravans[caravan]['player1'].value = calculateStackValue(game.caravans[caravan]['player1'].cards);
        game.caravans[caravan]['player2'].value = calculateStackValue(game.caravans[caravan]['player2'].cards);


        // Recalculate sold caravans
        for(var i = 0; i < game.caravans.length; i++){
            var caravanCursor = game.caravans[i];

            // Recalculate sold flag
            caravanCursor.sold = false;

            // Player1 wins
            if(
                // Score qualifies
                (caravanCursor.player1.value >= 21 && caravanCursor.player1.value <= 26)
                &&
                // Beats player 2 or player 2 is over 26
                (caravanCursor.player1.value > caravanCursor.player2.value || caravanCursor.player2.value > 26)
            ){
                caravanCursor.sold = 'player1';
            }
            // Player2 wins
            else if(
                // Score qualifies
                (caravanCursor.player2.value >= 21 && caravanCursor.player2.value <= 26)
                    &&
                    // Beats player 1 or player 1 is over 26
                    (caravanCursor.player2.value > caravanCursor.player1.value || caravanCursor.player1.value > 26)
            ){
                caravanCursor.sold = 'player2';
            }
            // Its a tie
            else if(caravanCursor.player1.value == caravanCursor.player2.value){
                caravanCursor.sold = true;
            }
        }


        // if its a tie it doesnt think its sold

        // If all caravans are sold, we might have a winner
        if(game.caravans[0].sold && game.caravans[1].sold && game.caravans[2].sold){
            var player1Sold = 0,
                player2Sold = 0;

            // Has either player sold at least two of the caravans?
            if(game.caravans[0].sold == 'player1') player1Sold++;
            if(game.caravans[1].sold == 'player1') player1Sold++;
            if(game.caravans[2].sold == 'player1') player1Sold++;

            if(game.caravans[0].sold == 'player2') player2Sold++;
            if(game.caravans[1].sold == 'player2') player2Sold++;
            if(game.caravans[2].sold == 'player2') player2Sold++;

            if(player1Sold >= 2){
                game.winner = 'player1';
            }else if(player2Sold >= 2){
                game.winner = 'player2';
            }
        }

        // Remove card from the player's deck
        deck.splice(card.index, 1);

        // Add move
        game.moves.push({
            player: player,
            card: card,
            target: target,
            caravan: caravan
        });

        // Change turn
        game.turn = (game.turn == 'player1') ? 'player2' : 'player1';

        // Update match in database
        params = { $set: {} };
        params.$set['match'] = game;
        Games.update( game._id, game);

        return true;
    }
});

Meteor.startup(function () {

});

/**
 * Calculates the value of a caravan stack.
 * @param stack
 * @returns {number}
 */
var calculateStackValue = function(stack){
    var stackValue = 0;

    for(var i = 0; i < stack.length; i++){
        var cardCursor = stack[i];

        // Root level card value
        var value;
        switch(cardCursor.value){
            case 'queen':
            case 'king':
            case 'jack':
                value = 0;
                break;
            default:
                value = parseInt(cardCursor.value);
        }
        stackValue += value;

        // Modifiers
        if(typeof cardCursor.modifiers != 'undefined' && cardCursor.modifiers != null){
            for(var x = 0; x < cardCursor.modifiers.length; x++){

                var modifierCard = cardCursor.modifiers[x];
                switch(modifierCard.value){
                    case 'king':
                        // Double value of the root card
                        stackValue += parseInt(cardCursor.value);
                        break;
                }

            }
        }

    }

    return stackValue;
};

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
    var deck = JSON.parse(JSON.stringify(defaultDeck));
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