/*
 The default starter deck is 1 of each card.
 */

defaultDeck = [
    // Hearts
    {
        suit: 'hearts',
        value: 2
    },
    {
        suit: 'hearts',
        value: 3
    },
    {
        suit: 'hearts',
        value: 4
    },
    {
        suit: 'hearts',
        value: 5
    },
    {
        suit: 'hearts',
        value: 6
    },
    {
        suit: 'hearts',
        value: 7
    },
    {
        suit: 'hearts',
        value: 8
    },
    {
        suit: 'hearts',
        value: 9
    },
    {
        suit: 'hearts',
        value: 10
    },
    {
        suit: 'hearts',
        value: 'jack'
    },
    {
        suit: 'hearts',
        value: 'queen'
    },
    {
        suit: 'hearts',
        value: 'king'
    },
    {
        suit: 'hearts',
        value: '1'
    },

    // Spades
    {
        suit: 'spades',
        value: 2
    },
    {
        suit: 'spades',
        value: 3
    },
    {
        suit: 'spades',
        value: 4
    },
    {
        suit: 'spades',
        value: 5
    },
    {
        suit: 'spades',
        value: 6
    },
    {
        suit: 'spades',
        value: 7
    },
    {
        suit: 'spades',
        value: 8
    },
    {
        suit: 'spades',
        value: 9
    },
    {
        suit: 'spades',
        value: 10
    },
    {
        suit: 'spades',
        value: 'jack'
    },
    {
        suit: 'spades',
        value: 'queen'
    },
    {
        suit: 'spades',
        value: 'king'
    },
    {
        suit: 'spades',
        value: '1'
    },

    // Clubs
    {
        suit: 'clubs',
        value: 2
    },
    {
        suit: 'clubs',
        value: 3
    },
    {
        suit: 'clubs',
        value: 4
    },
    {
        suit: 'clubs',
        value: 5
    },
    {
        suit: 'clubs',
        value: 6
    },
    {
        suit: 'clubs',
        value: 7
    },
    {
        suit: 'clubs',
        value: 8
    },
    {
        suit: 'clubs',
        value: 9
    },
    {
        suit: 'clubs',
        value: 10
    },
    {
        suit: 'clubs',
        value: 'jack'
    },
    {
        suit: 'clubs',
        value: 'queen'
    },
    {
        suit: 'clubs',
        value: 'king'
    },
    {
        suit: 'clubs',
        value: '1'
    },

    // Diamonds
    {
        suit: 'diamonds',
        value: 2
    },
    {
        suit: 'diamonds',
        value: 3
    },
    {
        suit: 'diamonds',
        value: 4
    },
    {
        suit: 'diamonds',
        value: 5
    },
    {
        suit: 'diamonds',
        value: 6
    },
    {
        suit: 'diamonds',
        value: 7
    },
    {
        suit: 'diamonds',
        value: 8
    },
    {
        suit: 'diamonds',
        value: 9
    },
    {
        suit: 'diamonds',
        value: 10
    },
    {
        suit: 'diamonds',
        value: 'jack'
    },
    {
        suit: 'diamonds',
        value: 'queen'
    },
    {
        suit: 'diamonds',
        value: 'king'
    },
    {
        suit: 'diamonds',
        value: '1'
    }
];


/*
 How to randomize a javascript array?
 http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */
shuffle = function (array) {
    var currentIndex = array.length
        , temporaryValue
        , randomIndex
        ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

/**
 * Determine if it's the specified players turn.
 * @param user
 * @param game
 */
isTurn = function (user, game) {
    return (game.player1 == user.username && game.turn == 'player1')
        || (game.player2 == user.username && game.turn == 'player2');
};

/**
 * Determine the specified player's seat in the game. (player1 or player2)
 * @param user
 * @param game
 * @returns {string}
 */
getSeat = function (user, game) {
    var player = null;
    if (game.player1 == user.username) {
        player = 'player1';
    } else if (game.player2 == user.username) {
        player = 'player2';
    }
    return player;
};

/**
 * Finds the card in the deck.
 * http://stackoverflow.com/questions/5579678/jquery-how-to-find-an-object-by-attribute-in-an-array
 * @param deck
 * @param cardId
 * @returns {*}
 */
findCardInDeck = function (deck, cardId) {
    var card = false;
    for (var i = 0; i < deck.length; i++) {
        if (deck[i].id == cardId) {
            card = deck[i];
            card.index = i;
        }
    }
    return card;
};


/**
 * Determine if the specified move is legal.
 * @param stack
 * @param card
 * @param target
 */
isLegalMove = function (stack, card, target) {

    // Are we trying to place a modifier?
    if (typeof target != 'undefined' && target != null) {

        // Only kings and jacks can be placed as modifiers
        switch (card.value) {
            case 'king':
            case 'jack':
                return true; // can go anywhere!
            default:
                return false;
        }
    }


    // Are we placing a regular card?
    if (target == null) {

        // No kings or jacks
        switch (card.value) {
            case 'king':
            case 'jack':
                return false;
        }


        var lastCardInStack = stack.cards[stack.cards.length - 1];
        if (typeof lastCardInStack !== 'undefined') {
            // If the new card isn't the same suit as the last card, it must follow the direction of the stack
            if (card.suit != lastCardInStack.suit) {

                if (card.value == '1') card.value = 1;

                // console.log('Direction analysis: ', stack.direction, card.value, lastCardInStack.value);

                // Card can't be of equal value if is a different suit
                if (card.value == lastCardInStack.value) return false;

                // Going up or down?
                if (stack.direction == 'asc') { // Up
                    // Card must be of greater value than the last one in the stack, queens allow you to change direction
                    if (card.value != 'queen' && card.value < lastCardInStack.value) return false;
                } else if (stack.direction == 'desc') { // Down
                    // Card must be of lesser value than the last one in the stack, queens allow you to change direction
                    if (card.value != 'queen' && card.value > lastCardInStack.value) return false;
                // Can't place a queen on a stack with no direction yet
                }else if (card.value == 'queen' && stack.direction == null){
                    return false;
                }

                // console.log('Passed');
            }
        }
    }

    return true;
};


/**
 * From http://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
 * @param str
 * @returns {string}
 */
htmlEntities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};