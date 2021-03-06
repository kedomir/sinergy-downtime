mod = angular.module('sin.fact.actions', ['sin.lib.persist']);

mod.factory('actions', function(persist) {
    var factory = {};
    var state = {};
    var changed = false;
  
    factory.data = {
        months: [
            {short: 'Jan', med: 'Jan',   long: 'January'},
            {short: 'Feb', med: 'Feb',   long: 'February'},
            {short: 'Mar', med: 'March', long: 'March'},
            {short: 'Apr', med: 'April', long: 'April'},
            {short: 'May', med: 'May',   long: 'May'},
            {short: 'Jun', med: 'June',  long: 'June'},
            {short: 'Jul', med: 'July',  long: 'July'},
            {short: 'Aug', med: 'Aug',   long: 'August'},
            {short: 'Sep', med: 'Sept',  long: 'September'},
            {short: 'Oct', med: 'Oct',   long: 'October'},
            {short: 'Nov', med: 'Nov',   long: 'November'},
            {short: 'Dec', med: 'Dec',   long: 'December'}
        ]
    };

    function isChanged() {
        return changed;
    }

    function defaultState() {
        state = {
            current: 0,
            actions: {
                player: [],
                contact: [],
                hireling: []
            }
        };
        state.current = new Date().getMonth();
    }

    defaultState();

    // --------------------------------------------------

    persist.registerLoad(function() {
        state = persist.doLoad('sin.fact.actions', state);
        changed = false;
    });
    persist.registerSave(function() {
        persist.doSave('sin.fact.actions', state);
        changed = false;
    });
    persist.registerWipe(function() { defaultState(); });
    persist.registerLongTerm(isChanged);

    // --------------------------------------------------

    factory.getCurrentMonth = function() {
        return state.current;
    };

    factory.getCurrentMonthName = function(type, offset) {
        if (type === undefined)
            type = 'short';
        if (offset === undefined)
            offset = 0;

        // Offset is holder over from multi-month functions
        // Leaving this in since it doesn't actually affect anything if omitted and might be useful in the futre
        return factory.data.months[(state.current + offset)%12][type];
    };
  
    factory.setCurrentMonth = function(change) {
        if ((change < 0) || (change > 11)) {
            return false;
        }
        state.current = change;
        return true;
    };
  
    // --------------------------------------------------

    factory.hasFilterAction = function(filter, type) {
        for (var i = 0; i < state.actions[filter].length; i++) {
            if (state.actions[filter][i].action == type) {
                return true;
            }
        }
        return false;
    };

    // --------------------------------------------------

    factory.getFilterActions = function(filter) {
        return state.actions[filter];
    };
  
    factory.getActions = function() {
        return state.actions.player
            .concat(state.actions.contact)
            .concat(state.actions.hireling);
    };
  
    factory.addAction = function(filter, action) {
        action.filter = filter;
        state.actions[filter].push(action);
    };
  
    factory.removeActionNum = function(filter, num) {
        state.actions[filter].splice(num, 1);
    };

    // --------------------------------------------------

    factory.getFilterCount = function(filter) {
        return state.actions[filter].length;
    };

    // --------------------------------------------------

    return factory;
});
