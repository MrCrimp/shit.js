 
!function(exports, $, undefined){
   var shitApps = [], rootDefined = false;
   
   function appNamespace(n, a){
      if( shitApps[n] ){
         for (var prop in a.prototype ) shitApps[n][prop] = a.prototype[prop];
      }  else {
         var inst = rootNamespace(n,a);
         inst.prototype._typeName = n;
         shitApps[n] = new inst();
      }
      return shitApps[n];
   }

   function rootNamespace(n, fn, parentNamespace){
     if ( !!parentNamespace ) return shitApps[parentNamespace][n] = fn;
     else return ( exports[n] = fn );
   }

   function Viewmodel( name, fn ){
      fn.prototype = Object.create(fn.prototype, { _typeName : {value:name}, _type : {value:'ViewModel'} } );
      fn.constructor = fn;
      this.dependencies[this._typeName][name] = fn;
      return rootNamespace( name, fn, this._typeName );
   }

   function Service( name, fn ){
      fn.prototype = Object.create(fn.prototype, { _typeName : {value:name} , _type : {value:'Service'} } );
      fn.constructor = fn;
      this.dependencies[this._typeName][name] = fn;
      return rootNamespace( name, fn, this._typeName );
   }

   function construct(constructor, args) {
      function Dependency() {
         return constructor.apply(this, args);
      }
      Dependency.prototype = constructor.prototype;
      return new Dependency();
   }

   function inject(obj){
      var dep = this.dependencies[this._typeName], target = obj, rx_args = /^function\s*[^\(]*\(\s*([^\)]*)\)/mi;
      var text = target.toString();
      var args = text.match(rx_args)[1].split(',');
       return !args.length || !args[0] ? new target() : construct(target, Array.prototype.slice.call( args.map( function(value){
          var svc = value ? value.trim() : null ;
          // only inject what has been defined
          if( !svc || !dep[svc]) return void 0;
            // dependency can be singleton, or needs to be new'ed up. supports one level of resolving, otherwise it's singleton and pre-injected
            return "object" == typeof dep[svc] ? dep[svc] : new dep[svc]();
      } ) ) )
   }
   
   
   exports.$Application = function( nameOrProt, proto ) {
      var instance, appl, actualProt, a = function(){};
      if ( typeof(nameOrProt  ) === "string" ){
         appl = nameOrProt;
         actualProt = proto;
      } else {
         appl = exports.document.querySelector("[data-app]").getAttribute("data-app") || "Application";
         actualProt = nameOrProt;
      }
      a.prototype = actualProt;      
      instance = new appNamespace( appl, a );
      a.prototype.databind = a.prototype.databind || function(){};
      a.prototype.init = a.prototype.init|| function(){};
      a.prototype.Viewmodel = Viewmodel.bind( instance );
      a.prototype.Service = Service.bind( instance )
      a.prototype.dependencies = a.prototype.dependencies || {};
      a.prototype.dependencies[appl] = {};
      a.prototype.resolved = false;
      a.prototype.resolve = function( svc, rootElement ){
         if( !shitApps[instance._typeName][svc] ) return;
         var target = "object"==typeof shitApps[instance._typeName][svc] ?
            shitApps[instance._typeName][svc] :
            shitApps[instance._typeName][svc] = inject.call( instance, shitApps[instance._typeName][svc] );         
         if( target._type === "ViewModel" ) instance.databind(shitApps[instance._typeName][svc], rootElement);
         return target;
      }
	  rootDefined= true;	  
      window.addEventListener('DOMContentLoaded', function (){
         if ( instance.resolved ) return;
         [].slice.call(document.querySelectorAll( "[data-view]" ) ).forEach( function ( view ) {
            var vm = view.getAttribute( "data-view" );
            if ( !vm || !vm.length ) return;
            view.dataset.viewmodel = instance.resolve( vm, view );
         }); instance.resolved = true;
      }, false); 
      instance.init(instance.dependencies[appl]);     
      return instance;
   }   
   exports.$hit = exports.$Application( function(){} );
   exports.$hit.Application = exports.$Application;
   exports.$hit.apps = shitApps; 
   return exports;
}( window );


