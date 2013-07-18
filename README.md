shit.js
=======
Just a quick little experiment to expore modularity after using AngularJS

100 lines of code trying to achieve a module and mvvm framework with some DI support written for mobile js apps

Demo files shows integration with knockout.js

```HTML
// data-app attribute maps to a root application
<!html data-app>
<!html data-app='someApp'>

// bind a viewmodel to a element
<div data-viewmodel='index'>
```

```javascript
// then value from data-app attribute is the name of our app, with fallback to '$Application' as the default. 
$hit.Application( function(){
  return {  
    activate: function($map){
      // app wide dependencies can be injected. $map is the same as this.cache which is a js hash
      $map.il8nData = {DEMO_STRING: { value: 'reloj', lang:'es'}};
    },
    databind: function(vm, element){
      //databind is a app level callback for all views
      // plugin knockout, or handlebars, or whatever
      ko.applyBindings(vm, element)
    }
  };  
});

// define a viewmodel, depend on l8nService, and the app scope by using '$scope'
$hit.ViewModel('index', function( il8nService, $scope ){
  this.title = il8nService.label('DEMO_STRING') + 'demo';
});

// Define a service to inject
// either syntax can be used, depending on use case
// $hit.Service
// or
someApp.Service('il8nService', function(il8nData, $scope){
  // argument '$scope' injects the app scope from caller should you need it
  this.data = il8nData;
  this.label: function(key){
    // data was injected app wide
    return this.data[key];
  }
});
```
