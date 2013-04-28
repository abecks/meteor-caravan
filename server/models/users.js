// No need to create a collection or publish a subscription. This is done by the smart package.

// Access rules
Meteor.users.allow({
    update: function(userId, user){
        return userId === user._id;
    }
});

