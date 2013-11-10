// Create minimongo objects
Moves = new Meteor.Collection("moves");


subscribeToMatch = function(tmpl){
    // Subscribe to the match when the template is instanced
    tmpl.matchHandler = Meteor.subscribe('match', Session.get('match'), function onComplete(){
        Session.set('matchLoaded', true);

        // Subscribe to the match chat
        tmpl.chatHandler = Meteor.subscribe('messages', Session.get('match'));

        // Subscribe to the moves collection
        tmpl.movesHandler = Meteor.subscribe('moves', Session.get('match'));
    });
}

Template.match.created = function(){
    var tmpl = this;

    Session.set('matchLoaded', false);

    // Determine if the user is already logged in, or needs to be authenticated as a guest
    if(Meteor.user() == null){
        Meteor.loginAnonymously(function(){
            subscribeToMatch(tmpl);
        });
    }else{
        subscribeToMatch(tmpl);
    }
}

// Stop subscriptions when the template is destroyed
Template.match.destroyed = function(){
    this.matchHandler.stop();
    this.chatHandler.stop();
    this.movesHandler.stop();
    Session.set('matchLoaded', false);
}

Template.match.matchId = function () {
    return Session.get('match');
};

Template.match.matchLoaded = function () {
    return Session.get('matchLoaded');
};

Template.match.matchVisibility = function () {
    var match = getMatch();
    if (match.public)
        return 'Public match';
    else
        return 'Private match';
};

Template.match.deck = function () {
    var match = getMatch(),
        seat = getSeat(Meteor.user(), match);
    if (seat) {
        return Template['deck']({
            cards: match.decks[seat]
        });
    }
};

Template.match.winnerName = function () {
    var match = getMatch();
    return match[match.winner];
};

Template.match.waitingForOpponent = function () {
    var match = getMatch(),
        seat = getSeat(Meteor.user(), match);

    if (seat == 'player1') {
        return match.player2 == null;
    } else {
        return match.player1 == null;
    }
};

// Match specific functions
// ------------------------------

/**
 * Returns the current game.
 * @returns {*|Cursor}
 */
getMatch = function () {
    return Games.findOne({ _id: Session.get('match') });
};

/**
 * Creates clickable controls to place cards.
 */
showCaravanControls = function () {

    // Determine the player's seat
    var seat = Session.get('seat'),
        match = getMatch(),
        caravansSetup = 0,
        $marker = $('<button></button>', {
            'class': 'card card-marker marker-stack select-caravan'
        });

    // Have all of the caravans been setup? (Had a card placed once)
    $.each(match.caravans, function (i, caravan) {
        if (caravan[seat].setup) {
            caravansSetup++;
        } else {
            var $caravan = $('.caravan:eq(' + i + ')'),
                $position = $caravan.children('.' + seat + '-cards');
            // Place a marker here
            $marker.clone().appendTo($position);
        }
    });

    // If all of the caravans have been setup, place a marker in each caravan
    if (caravansSetup == 3) {
        $('.caravan').each(function () {

            var caravan = $(this).index();
            var $newMarker = $marker.clone().appendTo($(this).find('.' + seat + '-cards'));

            // Find the active card
            var $card = $('#deck').find('.card.active'),
                card = {
                    id: $card.data('id'),
                    suit: $card.data('suit'),
                    value: $card.data('value')
                };

            // Verify the move is legal
            var match = getMatch();
            if (!isLegalMove(match.caravans[caravan][getSeat(Meteor.user(), match)], card, null)) {
                $newMarker.addClass('illegal-move');
            } else {
                $newMarker.removeClass('illegal-move');
            }
        });
    }
};

/**
 * Destroys the caravan controls.
 */
hideCaravanControls = function () {
    $('.card-marker').remove();
};


pollTimer = false;
updatePollTime = function () {
    var match = getMatch();

    // If the player is not in a match, kill the timer
    if (match == null && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = false;
    }

    Meteor.call('updatePollTime', match._id, function (err, id) {
        if (err) console.log(err);
    });
};


/*
 window.onbeforeunload = function(){
 // Currently in a match
 if(Session.get('matchLoaded')){
 return confirm('Are you sure you want to leave the game?');
 }

 return true;
 };*/


Template.match.events = {
    'click .select-caravan': function (e) {
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
        if (!isLegalMove(match.caravans[caravan][getSeat(Meteor.user(), match)], card, null)) return false;

        // Place card in caravan
        Meteor.call('playCard', Session.get('match'), caravan, card, null);
        Session.set('cardSelected', false);
    },

    'click #gameboard .card': function (e) {
        if (Session.get('cardSelected')) {

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
            if ($stack.hasClass('player1-cards')) {
                stack = 'player1'
            } else {
                stack = 'player2';
            }

            // Get index coordinates of target
            var target, $modifiers = $target.parents('.card-modifiers');
            if ($modifiers.length > 0) { // Is a modifier card
                target = {
                    id: $target.data('id'),
                    stack: stack,
                    index: [ $target.parents('.card').index(), $target.index() ]
                };
            } else { // Root of stack
                target = {
                    id: $target.data('id'),
                    stack: stack,
                    index: $target.index()
                };
            }

            // Verify the move is legal
            var match = getMatch();
            if (!isLegalMove(match.caravans[caravanIndex][stack], card, target)) return false;

            // Play card
            Meteor.call('playCard', Session.get('match'), caravanIndex, card, target);
            Session.set('cardSelected', false);
            $('.show-marker').removeClass('show-marker');
        }
    },

    'keypress #chat-input': function (e) {
        if (e.keyCode == 13) {
            var match = getMatch(),
                message = $(e.target).val();

            $(e.target).val('');

            Meteor.call('sendMessage', match._id, message);

            return false;
        }
    },

    'click .invite-link': function (e) {
        var input = e.target;
        input.focus();
        input.select();
    }
};



/**
 * Runs when a card is selected.
 */
Deps.autorun(function () {
    hideCaravanControls();

    if (Session.get('cardSelected')) {
        var $card = $('#deck').find('.card.active'),
            card = {
                id: $card.data('id'),
                suit: $card.data('suit'),
                value: $card.data('value')
            };

        if (!isNaN($card.data('value')) || $card.data('value') == 'queen')
            showCaravanControls();
    }
});





/**
 * Runs when the game data is loaded.
 */
Deps.autorun(function () {
    if (Session.get('matchLoaded')) {
        Session.set('seat', undefined); // Clear the seat from any previous games
        var match = getMatch();
        if (typeof match == 'undefined') return false;

        // Attempt to seat the player
        Meteor.call('seatPlayer', match._id, function (err, seat) {
            if (err) console.log(err);

            if (seat) { // Player has been seated
                Session.set('seat', seat);
            } else {
                alert('The match you tried to join is full.');
                Router.go('');
            }
        });

        // Update poll time
        if (!pollTimer) {
            pollTimer = setInterval(updatePollTime, 180000);
            updatePollTime();
        }
    } else {
        pollTimer = false;
    }
});