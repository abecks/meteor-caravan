Session.setDefault('loading', true);

/**
 * Global template helper functions.
 */
// Get current user in a template
Handlebars.registerHelper('user', function(){
    return Meteor.user();
});

// Determine if the app has loaded
Handlebars.registerHelper('isLoading', function(){
    return Session.get('loading');
});

// Determine if user is an admin
Handlebars.registerHelper('isAdmin', function(){
    var user = Meteor.user();
    if(user == null) return false;
    return Meteor.user().username == 'admin';
});

// Render a card
Handlebars.registerHelper("card", function() {
    return Template['card-'+this.suit+'-'+this.value]({id: this.id});
});

// Does the specified card have modifiers?
Handlebars.registerHelper("cardHasModifiers", function() {
    if(typeof this.modifiers == 'undefined') return false;
    return this.modifiers.length > 0;
});

// Global access to the match object
Handlebars.registerHelper("match", function(){
    return getMatch();
});


Meteor.startup(function(){
    Session.set('loading', false);
});



Template.index.events({
    // Create game
    'click #create-game': function(e){
        e.preventDefault();
        createGame();
    },

    // Join game
    'click #join-game': function(e){
        e.preventDefault();
        joinGame();
    },

    // Delete games
    'click #delete-games': function(e){
        e.preventDefault();
        Meteor.call('deleteGames');
    }
});

/**
 * Creates a new game.
 */
var createGame = function(){
    // Ask the server to create a game
    var game = Meteor.call('createGame', function(err, id){
        if(err) console.log(err);
        Router.go('match/'+id);
    });
};

/**
 * Joins an existing game.
 */
var joinGame = function(){
    // Ask the server for a game ID
    var matchId = Meteor.call('joinGame', function(err, matchId){
        if(err) console.log(err);
        if(matchId) Router.go('match/'+matchId);
    });
};


Meteor.methods({

    /**
     * Client stub.
     * Plays the specified card (does no rule checks).
     * @param match
     * @param caravan
     * @param card
     * @param target
     */
   'playCard': function(matchId,caravan,card,target){
        showMove(null,caravan,card,target);
        return true;
   }
});

/**
 * When the game's data is updated.
 */
Deps.autorun(function(){
    var gamesCollection = Games.find({ _id: Session.get('match')});

    gamesCollection.observeChanges({
        'removed': function(){
            Router.go('');
        },
        'changed': function(){
            updateCaravanValues();
        }
    });
});

/**
 * Determine the seat of the player's opponent.
 * @returns {string}
 */
getOpponent = function(){
    var match = getMatch();
    return (match.player1 == Meteor.user().username) ? 'player2' : 'player1';
};

/**
 * When the moves are updated.
 */
Deps.autorun(function(){
    var movesCollection = Moves.find();
    movesCollection.observe({
        'added': function(move){
            if(typeof move == 'undefined') return false;

            // Dont show the move if the card is already rendered
            var card = $('.card[data-id='+move.card.id+']');
            if(card.length > 0) return false;

            showMove(move.player,move.caravan,move.card,move.target);
        }
    });
});

/**
 * Show the player's move.
 * @param player
 * @param caravan
 * @param card
 * @param target
 */
showMove = function(player,caravan,card,target){
    // Add the card to the appropriate caravan
    var game = getMatch();

    // Dont playback your own moves
    var seat = getSeat(Meteor.user(), game);
    if(seat != player){
        if(player == null) player = seat;

        var $caravan = $('.caravan:eq('+caravan+')'),
            $card = $(Template['card-'+card.suit+'-'+card.value]({ id: card.id }));

        // Add animation classes
        $card.addClass('slideIn');

        if(typeof target != 'undefined' && target != null){

            // Find target card
            var $target = $('.card[data-id='+target.id+']');

            // Is the target a modifier card?
            if(typeof target.index == 'number'){ // Root card

                // Modifiers are contained as siblings
                var $modifiers = $target.children('.card-modifiers');
                if($modifiers.length == 0){
                    $modifiers = $('<div></div>', {
                        'class': 'card-modifiers'
                    }).appendTo($target);
                }

                // Add to modifiers
                $card.prependTo($modifiers);

            }else{// Modifier card

                var $modifiers = $target.parents('.card-modifiers');
                // Add modifier card as a sibling to the others
                $modifiers.children().eq(target.index[1]).after($card);

            }


        }else{ // Add to caravan normally
            var position;
            if(player == 'player1'){
                position = '.player1-cards';
            }else{
                position = '.player2-cards';
            }

            $card.appendTo($caravan.children(position));
        }



        // Begin animation
        setTimeout(function(){
            $card.removeClass('slideIn');


            if(card.value == 'jack'){
                var $cards = $card.add($target);

                // After the animation, remove them both
                setTimeout(function(){
                    $cards.addClass('slideIn');
                    setTimeout(function(){
                        $cards.remove();
                    }, 1000);
                }, 1100);


            }
        }, 50);
    }

    updateCaravanValues();
};

var updateCaravanValues = function(){
    var game = getMatch();

    $('.oversold').removeClass('oversold');

    $('.caravan').each(function(i){
        var $p1Value = $(this).find('.player1-value'),
            $p2Value = $(this).find('.player2-value');

        $p1Value.text(game.caravans[i].player1.value);
        if(game.caravans[i].player1.value > 26) $p1Value.addClass('oversold');

        $p2Value.text(game.caravans[i].player2.value);
        if(game.caravans[i].player2.value > 26) $p2Value.addClass('oversold');
    });
};

Meteor.startup(function(){
    Session.set('cardSelected', false);
});