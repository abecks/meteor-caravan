// Create minimongo object
Servers = new Meteor.Collection("servers");

// Subscribe to 'servers' collection on startup.
var serversHandle = Meteor.subscribe('servers');

Template.servers.servers = function () {
    return Servers.find({}, {sort: {name: 1}});
};