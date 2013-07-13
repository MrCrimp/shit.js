shit.js
=======
99 LOC module and mvvm framework with some DI support

Demo files shows integration with knockout.js

```HTML
// data-app attribute
<!html data-app>
<!html data-app='someApp'>

// bind a viewmodel to a element
<div data-viewmodel='index'>
```

```javascript
// if 'someApp' is skipped, then 'Application' is the default. Even `var someApp=` can be skipped for simple apps
var someApp = $hit.Application('someApp', function(){
  return {
    init: function($map){
      // app wide dependencies
      $map.l8nData = {DEMO_STRING: { value: 'reloj', lang:'es'}};
    },
    databind: function(vm){
      //databind is a app level callback for all views
      // plugin knockout, or handlebars, or whatever
      ko.applyBindings(vm)
    }
  };  
});

// define a viewmodel, depend on l8nService
$hit.ViewModel('index', function( l8nService ){
  this.title = l8nService.label('DEMO_STRING') + 'demo';
});

// Define a service to inject
// either syntax can be used, depending on use case
// $hit.Service
// or
someApp.Service('l8nService', function(l8nData){
  this.label: function(key){
    // data is injected app wide
    return this.data[key];
  }
});
```
