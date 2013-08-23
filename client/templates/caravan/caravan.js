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


Template.caravan.oversold = function(position, caravan){
    var match = getMatch(),
        value;

    if(position == 'top'){

        var opponent = getOpponent();
        value = caravan[opponent];

    }else{

        var seat = getSeat(Meteor.user(), match);
        value = caravan[seat];

    }

    if(value > 26) return 'oversold';
};

Template.caravan.setup = function(position,caravan){
    console.log(caravan);
    var setup = false;
    if(position == 'top'){
        var opponent = getOpponent();
        setup = caravan[opponent].setup;
    }else{
        var seat = getSeat(Meteor.user(), getMatch());
        setup = caravan[seat].setup;
    }

    return (setup ? 'setup' : '');
};

Template.caravan.topValue = function(){
    var opponent = getOpponent();
    return this[opponent].value;
};

Template.caravan.bottomValue = function(){
    var match = getMatch(),
        seat = getSeat(Meteor.user(), match);

    return this[seat].value;
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

Template.caravan.playerClass = function(position,slug){
    var match = getMatch();

    if(position == 'top'){

        // Top should always be the opponent
        if(match.player1 == Meteor.user().username){
            return 'player2-'+slug;
        }else{
            return 'player1-'+slug;
        }

    }else{

        // Bottom should always be the player
        if(match.player1 == Meteor.user().username){
            return 'player1-'+slug;
        }else{
            return 'player2-'+slug;
        }

    }
};

