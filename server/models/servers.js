// Create collection
Servers = new Meteor.Collection("servers");

// Access rules
Servers.allow({
    insert: function(userId, server){
        return true;
    },
    update: function(userId, server){
        return true;
    },
    remove: function(userId, server){
        return true;
    }
});

// Publish complete set of lists to all clients.
Meteor.publish('servers', function () {
    return Servers.find();
});