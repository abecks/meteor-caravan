Template.deck.hand = function(cards){
    return cards.slice(0,8);
};

Template.deck.turn = function(){
    var match = getMatch();
    if(match.turn == getSeat(Meteor.user(), match))
        return 'your-turn';
};

Template.deck.events = {
    'click .card': function(e){
        e.preventDefault();

        Session.set('cardSelected', false);

        var match = getMatch();

        // Match is over
        if(match.winner !== false) return false;

        // Make sure it's your turn!
        if(!isTurn(Meteor.user(),getMatch())) return false;

        var $card = $(e.currentTarget);
        if($card.hasClass('active')){
            $card.removeClass('active');
            // Session.set('cardSelected', false);
        }else{
            $('#deck').find('.card.active').removeClass('active');
            $card.addClass('active');
            Session.set('cardSelected', true);
        }
    }
};