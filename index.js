 
 // define a viewmodel that requires the app wide 'model' set in app.activate, 
 // the localeService defined using $hit.Service, and finally the 'this' scope for the App itself
$hit.ViewModel("index", function( model, localeService, $scope ){ 'use strict';
   
   this.labels = {
      today: localeService.day(model.updatedAt)
   };

	this.title = model.name + ' (updated ' + localeService.fromNow( model.updatedAt )+ ') runs in mode ' + $scope.mode;

	this.model = model;

});

