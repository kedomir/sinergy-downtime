mod = angular.module('sin.dtime.events', ['sin.fact.events']);

mod.component('dtEvents', {
    controller: EventsController,
    templateUrl: 'sections/events/template-events.html'
});

function EventsController($scope, events) {
    $scope.events = events;
}
