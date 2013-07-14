// Subscribe to collection on startup.
Deps.autorun(function(){
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

var getMatch = function(){
    return Games.findOne({ _id: Session.get('match') });
};


Deps.autorun(function(){
   if(Session.get('gamesLoaded')){
       var match = getMatch();
       if(typeof match == 'undefined') return false;

       // Seat the player if there is an empty seat
       if(match.player1 == null || match.player2 == null){
           // Try to join the empty seat
           Meteor.call('seatPlayer', match._id);
       }
   }
});