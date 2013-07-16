// Subscribe to collection on startup.
Deps.autorun(function(){
    Session.set('gamesLoaded', false);
    Meteor.subscribe('match', Session.get('match'), function onComplete(){
            Session.set('gamesLoaded', true);
    });
});

Template.match.matchId = function(){
    return Session.get('match');
};

Template.match.matchLoaded = function(){
    return Session.get('gamesLoaded');
};

Template.match.matchVisibility = function(){
    var match = getMatch();
    if(match.public)
        return 'Public match';
    else
        return 'Private match';
};

Template.match.deck = function(){
    // Determine the player's deck
    var deck, match = getMatch();
    if(typeof match == 'undefined') return;
    if(match.player1 == Meteor.user().username){
        deck = match.decks.player1;
    }else if(match.player2 == Meteor.user().username){
        deck = match.decks.player2;
    }else{
        return;
    }

    return Template['deck']({
        cards: deck
    });
};

Template.match.match = function(){
    return getMatch();
};

Template.match.events = {
    'click .select-caravan': function(e){
        e.preventDefault();

        // Find the active card
        var $card = $('#deck').find('.card.active'),
            card = {
                suit: $card.data('suit'),
                value: $card.data('value')
            },
            caravan = $(e.currentTarget).parents('.caravan').index();

        // Place card in caravan
        Meteor.call('playCard', Session.get('match'), caravan, card, null);

        Session.set('cardSelected', false);
    }
};

/**
 * Returns the current game.
 * @returns {*|Cursor}
 */
getMatch = function(){
    return Games.findOne({ _id: Session.get('match') });
};


/**
 * Runs when the game data is loaded.
 */
Deps.autorun(function(){
   if(Session.get('gamesLoaded')){
       Session.set('seat', undefined); // Clear the seat from any previous games
       var match = getMatch();
       if(typeof match == 'undefined') return false;

       // Attempt to seat the player
       Meteor.call('seatPlayer', match._id, function(err, seat){
           if(err) console.log(err);

           if(seat){ // Player has been seated
               Session.set('seat', seat);
           }else{
               alert('The match you tried to join is full.');
               Router.go('');
           }
       });

   }
});

/**
 * Creates clickable controls to place cards.
 */
var showCaravanControls = function(){
    // Determine the player's seat
    var seat = Session.get('seat');

    $('.caravan').each(function(){
        // Place basic stack marker in each caravan
        var $stack = $('<button></button>', {
            'class': 'card card-marker marker-stack select-caravan'
        });

        var cardStack;
        if(seat == 'player1'){
            cardStack = '.player-1-cards';
        }else{
            cardStack = '.player-2-cards';
        }

        $stack.appendTo($(this).find(cardStack));
    });
};

/**
 * Destroys the caravan controls.
 */
var hideCaravanControls = function(){
    $('.card-marker').remove();
};

/**
 * Runs when a card is selected.
 */
Deps.autorun(function(){
   if(Session.get('cardSelected')){
       showCaravanControls();
   }else{
       hideCaravanControls();
   }
});



