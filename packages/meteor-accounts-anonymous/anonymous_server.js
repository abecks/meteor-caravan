(function() {
  
  // handler to login anonymously
  Accounts.registerLoginHandler(function(options) {
    if (!options.anonymous)
      return undefined; // don't handle

    // Generate random username
    var username = 'Guest' + Math.floor((Math.random()*10000)+1);

    // Ensure its not taken
    while(Meteor.users.find({ username: username }).count > 0){
      username = 'Guest' + Math.floor((Math.random()*10000)+1);
    }
    
    // ok; if they are logging in, this means they don't have
    // a user yet. Create one. We don't need to ever find it again.
    var user = {services: {}, username: username, guest: true};
    options = _.clone(options);
    options.generateLoginToken = true;
    return Accounts.insertUserDoc(options, user);
  });
})();
