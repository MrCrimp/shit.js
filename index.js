 
$hit.Viewmodel("index", function( model, localeService ){ 'use strict';

   this.labels = {
      today: localeService.day(model.updatedAt)
   };

	this.title = model.name + ' (updated ' + localeService.fromNow( model.updatedAt )+ ')';

	this.model = model;

});

