Session.setDefault('registerError', false);

Template.register.events({
    'submit': function(e){
        e.preventDefault();
        e.stopPropagation();

        var email = $("#inputEmail").val(),
            username = $("#inputUsername").val(),
            password = $("#inputPassword").val();

        // Should validate email and password here


        // Clear loginError flag
        Session.set('registerError', false);


        // If you are a guest, logout first
        if(Meteor.user() != null && typeof Meteor.user().emails != 'undefined'){
            Meteor.logout();
        }

        Accounts.createUser(
        {
            email: email,
            username: username,
            password: password
        }, function(error){
            if(error){
                Session.set('registerError', error.reason);
            }else{
                Router.go('');
            }
        });
    }
});

Template.register.register_error = function(){
    return Session.get('registerError');
};