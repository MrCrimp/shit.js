$hit.Service("localeService", function(){

  this.addDaysAndSetHour = function(date, days, hour){
      var d = moment( date );
      d.add('days', days );
      d.hour( hour );
      return d.toDate();
   };

   this.day = function(date){
      var yesterday = moment( date ).date() + 1 === moment().date() ? 'Yesterday' : false;
      var tomorrow = moment( date ).date()-1 === moment().date() ? 'Tomorrow' : false;
      var today = moment( date ).date() === moment().date() ? 'Today' : false;
      return yesterday || today || tomorrow || m( date ).format( 'dddd Do' );
   };

   this.dayAbbr = function(date){
      return moment( date ).format( 'ddd' );
   };

   this.fromNow = function(date){
      return moment( date ).fromNow();
   }

});