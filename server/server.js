/**
 * Example server-side methods to delete collections.
 */
Meteor.methods({
    'deleteServers': function(){
        Servers.remove({});
    },
    'deleteUsers': function(){
        Meteor.users.remove({});
    }
});

Meteor.startup(function () {

    // Check to see if we have some example servers in the DB.
    if(Servers.find().count() == 0){
        var data = [
            {
                name: 'Localhost',
                ip: '127.0.0.1',
                type: 'Windows'
            },
            {
                name: 'Google Talk',
                ip: '74.125.141.125',
                type: 'XMPP'
            },
            {
                name: 'OpenDNS',
                ip: '208.67.222.222',
                type: 'DNS'
            }
        ];

        for(var i = 0; i < data.length; i++){
            Servers.insert(data[i]);
        }
    }
});

