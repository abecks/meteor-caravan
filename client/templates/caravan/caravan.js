Deps.autorun(function(){
    if(Session.get('cardSelected')){
        $('.select-caravan').removeClass('hide');
    }else{
        $('.select-caravan').addClass('hide');
    }
});