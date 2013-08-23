// Create minimongo objects
Moves = new Meteor.Collection("moves");

// Subscribe to collection on startup.
Deps.autorun(function(){
    Session.set('gamesLoaded', false);

    // Subscribe to the match
    Meteor.subscribe('match', Session.get('match'), function onComplete(){
        Session.set('gamesLoaded', true);

        // Subscribe to the chat
        Meteor.subscribe('messages', Session.get('match'));

        // Subscribe to the game moves
        Meteor.subscribe('moves', Session.get('match'));
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
            if($stack.hasClass('player1-cards')){
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
    },

    'keypress #chat-input': function(e){
        if(e.keyCode == 13){
            var match = getMatch(),
                message = $(e.target).val();

            $(e.target).val('');

            Meteor.call('sendMessage', match._id, message);

            return false;
        }
    },

    'mouseenter .marker-stack': function(e){
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
        if(!isLegalMove(match.caravans[caravan][getSeat(Meteor.user(),match)], card, null)){
            $(e.target).addClass('illegal-move');
        }else{
            $(e.target).removeClass('illegal-move');
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

       // Update poll time
       if(!pollTimer){
           pollTimer = setInterval(updatePollTime, 180000);
           updatePollTime();
       }
   }
});

/**
 * Creates clickable controls to place cards.
 */
var showCaravanControls = function(){
    // Determine the player's seat
    var seat = Session.get('seat'),
        match = getMatch(),
        caravansSetup = 0,
        $marker = $('<button></button>', {
        'class': 'card card-marker marker-stack select-caravan'
    });

    // Have all of the caravans been setup? (Had a card placed once)
    $.each(match.caravans, function(i, caravan){
        if(caravan[seat].setup){
            caravansSetup++;
        }else{
            var $caravan = $('.caravan:eq('+i+')'),
                $position = $caravan.children('.'+seat+'-cards');
            // Place a marker here
            $marker.clone().appendTo($position);
        }
    });

    // If all of the caravans have been setup, place a marker in each caravan
    if(caravansSetup == 3){
        $('.caravan').each(function(){
            $marker.clone().appendTo($(this).find('.'+seat+'-cards'));
        });
    }
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

var pollTimer = false;
updatePollTime = function(){
    var match = getMatch();

    // If the player is not in a match, kill the timer
    if(match == null && pollTimer){
        clearInterval(pollTimer);
        pollTimer = false;
    }

    Meteor.call('updatePollTime', match._id, function(err, id){
        if(err) console.log(err);
    });
};

/*
window.onbeforeunload = function(){
    // Currently in a match
    if(Session.get('gamesLoaded')){
        return confirm('Are you sure you want to leave the game?');
    }

    return true;
};*/
