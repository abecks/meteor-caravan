Session.setDefault('loginError', false);

Template.login.events({
    'submit': function(e){
        e.preventDefault();
        e.stopPropagation();

        var email = $("#inputEmail").val(),
            password = $("#inputPassword").val();

        // Should validate email and password here


        // Clear loginError flag
        Session.set('loginError', false);
        Meteor.loginWithPassword(email,password,function(error){
            if(error){
                Session.set('loginError', error.reason);
            }else{
                Router.go('');
            }
        });

    }
});

Template.login.login_error = function(){
    return Session.get('loginError');
};