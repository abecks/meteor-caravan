Template.caravan.cardWithModifiers = function(){
    console.log(this);

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