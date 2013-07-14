// Subscribe to collection on startup.
Deps.autorun(function(){
    Meteor.subscribe('match', Session.get('match'));
});

Template.match.matchId = function(){
    return Session.get('match');
};


Template.match.match = function(){
    return Games.findOne({ _id: Session.get('match') });
};