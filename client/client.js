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
    return Template['card-'+this.suit+'-'+this.value]();
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
    var gameQuery = Games.find({ _id: Session.get('match')});

    gameQuery.observeChanges({
        'removed': function(){
            Router.go('');
        },
        'changed': function(id, fields){
            // Register new moves
            if(typeof fields.moves != 'undefined' && fields.moves.length > 0){
                var lastMove = fields.moves[fields.moves.length-1];
                showMove(lastMove.player,lastMove.caravan,lastMove.card,lastMove.target);
            }
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
            $card = $(Template['card-'+card.suit+'-'+card.value]());

        // Add animation classes
        $card.addClass('slideIn');

        var position;
        if(player == 'player1'){
            position = '.player-1-cards';
        }else{
            position = '.player-2-cards';
        }

        $card.appendTo($caravan.children(position));

        // Begin animation
        setTimeout(function(){
            $card.removeClass('slideIn');
        }, 50);
    }

    updateCaravanValues();
};

var updateCaravanValues = function(){
    var game = getMatch();
    $('.caravan').each(function(i){
        $(this).find('.player-1-value').text(game.caravans[i].player1.value);
        $(this).find('.player-2-value').text(game.caravans[i].player2.value);
    });
};

Meteor.startup(function(){
    Session.set('cardSelected', false);
});