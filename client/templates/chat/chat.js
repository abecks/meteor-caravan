// Create minimongo objects
Messages = new Meteor.Collection("messages");

Template.chat.messages = function(){
    return Messages.find();
};