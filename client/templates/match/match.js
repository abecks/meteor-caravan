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
            caravan = $(e.currentTarget).parent().index();

        // Place card in caravan
        Meteor.call('playCard', Session.get('match'), caravan, card, null);

        Session.set('cardSelected', false);
    }
};

getMatch = function(){
    return Games.findOne({ _id: Session.get('match') });
};


Deps.autorun(function(){
   if(Session.get('gamesLoaded')){
       var match = getMatch();
       if(typeof match == 'undefined') return false;

       // Seat the player if there is an empty seat
       if(match.player1 != Meteor.user().username && match.player2 != Meteor.user().username){
           if(match.player1 == null || match.player2 == null){
               // Try to join the empty seat
               Meteor.call('seatPlayer', match._id);
           }
       }

   }
});