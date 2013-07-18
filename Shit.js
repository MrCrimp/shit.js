!function(root, undefined){
   var shitApps = [];

   function module(a,fn){
      return (window.define && window.define.amd) ? define(a, [], fn) : this[a] = fn;
   }

   function appScope(n, a){
      if( shitApps[n] ){
         for (var prop in a.prototype ) shitApps[n][prop] = a.prototype[prop];
      }  else {
         var inst = nestedScope(n,a);
         inst.prototype._typeName = n;
         shitApps[n] = new inst();
      }
      return shitApps[n];
   }

   function nestedScope(n, fn, parentNamespace){
      if ( !!parentNamespace ) {
         return module.call(shitApps[parentNamespace], n,fn);
      }
      else return ( root[n] = fn );
   }

   function Viewmodel( name, fn ){
      fn.prototype = Object.create(fn.prototype, { _typeName : {value:name}, _type : {value:'ViewModel'} } );
      fn.constructor = fn;
      this.cache[this._typeName][name] = fn;
      return nestedScope( name, fn, this._typeName );
   }

   function Service( name, fn ){
      fn.prototype = Object.create(fn.prototype, { _typeName : {value:name} , _type : {value:'Service'} } );
      fn.constructor = fn;
      this.cache[this._typeName][name] = fn;
      return nestedScope( name, fn, this._typeName );
   }

   function construct(constructor, args) {
      function Dependency() {
         return constructor.apply(this, args);
      }
      Dependency.prototype = constructor.prototype;
      return new Dependency();
   }

   function inject(obj){
      var o = this, dep = this.cache[this._typeName], target = obj, rx_args = /^function\s*[^\(]*\(\s*([^\)]*)\)/mi;
      var text = target.toString();
      var args = text.match(rx_args)[1].split(',');
      return !args.length || !args[0] ? new target() : construct(target, Array.prototype.slice.call( args.map( function(value){
         var svc = value ? value.trim() : null ;
         if( !svc || !dep[svc]) return void 0;
         return "object" == typeof dep[svc] || 'then' in dep[svc] ? dep[svc] : inject.call(o, dep[svc] ); // promise, singleton, or recursive inject
      } ) ) )
   }

   var Application = function( nameOrProt, proto ) {
      var instance, appl, actualProt, a = function(){};
      if ( typeof(nameOrProt  ) === "string" ){
         appl = nameOrProt;
         actualProt = proto;
      } else {
         appl = root.document ? root.document.querySelector("[data-app]").getAttribute("data-app") || "$Application" : "$Application";
         actualProt = nameOrProt;
      }
      a.prototype = actualProt;
      instance = new appScope( appl, a );
      a.prototype.databind = a.prototype.databind || function(){};
      a.prototype.activate = a.prototype.activate || function(){};
      a.prototype.Viewmodel = Viewmodel.bind( instance );
      a.prototype.Service = Service.bind( instance )
      a.prototype.cache = a.prototype.cache || {};
      a.prototype.cache[appl] = {};
      a.prototype.resolved = false;
      a.prototype.resolve = function( svc, rootElement ){
         if( !shitApps[instance._typeName][svc] ) return;
         var target = "object"==typeof shitApps[instance._typeName][svc] ?
            shitApps[instance._typeName][svc] :
            shitApps[instance._typeName][svc] = inject.call( instance, shitApps[instance._typeName][svc] );
         if( target._type === "ViewModel" ) instance.databind.call(instance, shitApps[instance._typeName][svc], rootElement );
         return target;
      }
      window.addEventListener('DOMContentLoaded', function (){
         if ( instance.resolved ) return;
         [].slice.call( document.querySelectorAll( "[data-view]" ) ).forEach( function ( el ) {
            var vm = el.getAttribute( "data-view" );
            if ( !vm || !vm.length ) return;
            el.dataset.viewmodel = instance.resolve( vm, el );
         }); instance.resolved = true;
      }, false);
      instance.activate.call(instance, instance.cache[appl]);
      return instance;
   }
   root.$hit = Application( function(){} );
   root.$hit.Application = Application;
   if ( window && window.define && window.define.amd) window.define("shitjs", [], function() { return root; });
   return root;
}( window );


