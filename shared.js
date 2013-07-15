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
        value: 'ace'
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
        value: 'ace'
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
        value: 'ace'
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
        value: 'ace'
    }
];



/*
 How to randomize a javascript array?
 http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */
shuffle = function(array){
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
isTurn = function(user,game){
    return (game.player1 == user.username && game.turn == 'player1')
        || (game.player2 == user.username && game.turn == 'player2');
};

/**
 * Determine the specified player's seat in the game. (player1 or player2)
 * @param user
 * @param game
 * @returns {boolean}
 */
getSeat = function(user,game){
    var player = false;
    if(game.player1 == user.username){
        player = 'player1';
    }else if(game.player2 == user.username){
        player = 'player2';
    }
    return player;
};