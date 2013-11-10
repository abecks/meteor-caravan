(function() {
  Meteor.loginAnonymously = function(fn) {
    Accounts.callLoginMethod({methodArguments:[{anonymous:true}],userCallback:fn});
  }
})();
