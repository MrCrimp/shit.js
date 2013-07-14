shit.js
=======
99 lines of code, module and mvvm framework with some DI support written for mobile js apps

Demo files shows integration with knockout.js

```HTML
// data-app attribute maps to a root application
<!html data-app>
<!html data-app='someApp'>

// bind a viewmodel to a element
<div data-viewmodel='index'>
```

```javascript
// if 'someApp' is skipped, then 'Application' is the default. Even `var someApp=` can be skipped 
$hit.Application('someApp', function(){
  return {
    init: function($map){
      // app wide dependencies
      $map.il8nData = {DEMO_STRING: { value: 'reloj', lang:'es'}};
    },
    databind: function(vm, element){
      //databind is a app level callback for all views
      // plugin knockout, or handlebars, or whatever
      ko.applyBindings(vm, element)
    }
  };  
});

// define a viewmodel, depend on l8nService
$hit.ViewModel('index', function( il8nService ){
  this.title = il8nService.label('DEMO_STRING') + 'demo';
});

// Define a service to inject
// either syntax can be used, depending on use case
// $hit.Service
// or
someApp.Service('l8nService', function(il8nData){
  this.data = il8nData;
  this.label: function(key){
    // data was injected app wide
    return this.data[key];
  }
});
```
