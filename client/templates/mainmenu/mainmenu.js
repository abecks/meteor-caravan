Template.mainmenu.events = {
    'click .logout': function(e){
        e.preventDefault();
        e.stopPropagation();

        Meteor.logout();
        Router.go('');
    }
};

Template.mainmenu.showAuthControls = function(){
	return Meteor.user() == null || typeof Meteor.user().emails == 'undefined';
}

Template.mainmenu.showLogout = function(){
	return Meteor.user() != null && typeof Meteor.user().emails != 'undefined';
}