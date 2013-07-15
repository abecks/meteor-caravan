Deps.autorun(function(){
    if(Session.get('cardSelected')){
        $('.select-caravan').removeClass('hide');
    }else{
        $('.select-caravan').addClass('hide');
    }
});

Template.caravan.events = {
    'click .select-caravan': function(e){
        e.preventDefault();

        // Find the active card
        var $card = $('#deck').find('.card.active'),
            suit = $card.data('suit'),
            value = $card.data('value'),
            caravan = $(e.currentTarget).parent().index();

        // Remove card from DOM


        // Place card in caravan
        Meteor.call('playCard', Session.get('match'), caravan, suit, value);

        Session.set('cardSelected', false);
    }
};