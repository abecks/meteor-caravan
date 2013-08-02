Template.caravan.cardWithModifiers = function(){
    // Render modifiers if there are any
    if(typeof this.modifiers != 'undefined' && this.modifiers != null){
        var $modifiers = $('<div></div>', {
            'class': 'card-modifiers'
        });

        $.each(this.modifiers, function(i, modifier){
            var $card = $(Template['card-'+modifier.suit+'-'+modifier.value]({id: modifier.id}));
            $modifiers.append($card);
        });
        return Template['card-'+this.suit+'-'+this.value]({id: this.id, modifiers: this.modifiers});
    }else{
        return Template['card-'+this.suit+'-'+this.value]({id: this.id});
    }
};

Template.caravan.oversold = function(value){
    if(value > 26) return 'oversold';
};

Template.caravan.topCards = function(caravan){
    var match = getMatch();

    // Top cards are always the opponents
    if(match.player1 == Meteor.user().username)
        return caravan.player2.cards;
    else
        return caravan.player1.cards;
};

Template.caravan.bottomCards = function(caravan){
    var match = getMatch();

    // Bottom cards are always the players
    if(match.player1 == Meteor.user().username)
        return caravan.player1.cards;
    else
        return caravan.player2.cards;
};

Template.caravan.playerCardClass = function(position){
    var match = getMatch();

    if(position == 'top'){

        // Top should always be the opponent
        if(match.player1 == Meteor.user().username){
            return 'player2-cards';
        }else{
            return 'player1-cards';
        }

    }else{

        // Bottom should always be the player
        if(match.player1 == Meteor.user().username){
            return 'player1-cards';
        }else{
            return 'player2-cards';
        }

    }
};