Template.mainmenu.events = {
    'click .logout': function(e){
        e.preventDefault();
        e.stopPropagation();

        Meteor.logout();
        Router.go('');
    }
};