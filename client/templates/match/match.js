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
    var match = getMatch(),
        seat = getSeat(Meteor.user(), match);
    if(seat){
        return Template['deck']({
            cards: match.decks[seat]
        });
    }
};

Template.match.winnerName = function(){
    var match = getMatch();
    return match[match.winner];
};

Template.match.events = {
    'click .select-caravan': function(e){
        e.preventDefault();

        // Find the active card
        var $card = $('#deck').find('.card.active'),
            card = {
                id: $card.data('id'),
                suit: $card.data('suit'),
                value: $card.data('value')
            },
            caravan = $(e.currentTarget).parents('.caravan').index();

        // Verify the move is legal
        var match = getMatch();
        if(!isLegalMove(match.caravans[caravan][getSeat(Meteor.user(),match)], card, null)) return false;

        // Place card in caravan
        Meteor.call('playCard', Session.get('match'), caravan, card, null);
        Session.set('cardSelected', false);
    },

    'click #gameboard .card': function(e){
        if(Session.get('cardSelected')){

            var $card = $('#deck').find('.card.active'),
                card = {
                    id: $card.data('id'),
                    suit: $card.data('suit'),
                    value: $card.data('value')
                },
                $target = $(e.currentTarget),
                caravanIndex = $target.parents('.caravan').index();

            // Determine stack
            var $stack = $target.parents('.caravan-cards'),
                stack;
            if($stack.hasClass('player-1-cards')){
                stack = 'player1'
            }else{
                stack = 'player2';
            }

            // Get index coordinates of target
            var target, $modifiers = $target.parents('.card-modifiers');
            if($modifiers.length > 0){ // Is a modifier card
                target = {
                    id: $target.data('id'),
                    stack: stack,
                    index: [ $target.parents('.card').index(), $target.index() ]
                };
            }else{ // Root of stack
                target = {
                    id: $target.data('id'),
                    stack: stack,
                    index: $target.index()
                };
            }

            // Verify the move is legal
            var match = getMatch();
            if(!isLegalMove(match.caravans[caravanIndex][stack], card, target)) return false;


            // Play card
            Meteor.call('playCard', Session.get('match'), caravanIndex, card, target);
            Session.set('cardSelected', false);
            $('.show-marker').removeClass('show-marker');
        }
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



