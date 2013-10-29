! function(root, undefined) {

   var 
      isInitializing = false,
      shitApps = [];

   function construct(constructor, args) {
      function Dependency() {
         return constructor.apply(this, args);
      }
      Dependency.prototype = constructor.prototype;
      return new Dependency();
   }

   function isPromise(object) {
      return object.hasOwnProperty('then');
   }

   function isInstance(object) {
      return "object" == typeof object;
   }

   function expandAndResolveArgumentsFromFunctionString(argumentList, targetScope) {

      var argumentArray = argumentList.map(function(value) {
                  
         var
            targetTypeName = value ? value.trim() : null,        
            scopeType = targetTypeName === '$scope' ? targetScope : void 0,    
            requestedType = scopeType || targetScope[targetTypeName] || targetScope.cache[targetScope._typeName][targetTypeName]; 
            
         if (!targetTypeName || !requestedType) 
            return void 0;

         return isInstance(requestedType) || isPromise(requestedType) ? requestedType : inject.call(targetScope, requestedType); // instance, promise, singleton, or recursive inject
      });

      return [].slice.call(argumentArray);
   }

   function module(a, fn) {
      return (window.define && window.define.amd) ? define(a, [], fn) : this[a] = fn;
   }

   function appScope(appName, applicationType) {
      if (shitApps[appName]) {
         for (var prop in applicationType.prototype) {
            shitApps[appName][prop] = applicationType.prototype[prop];
         }
      } else {
         var inst = nestedScope(appName, applicationType);
         inst.prototype._typeName = appName;
         shitApps[appName] = new inst();
      }
      return shitApps[appName];
   }

   function nestedScope(n, fn, parentNamespace) {
      if ( !! parentNamespace) {
         return module.call(shitApps[parentNamespace], n, fn);
      } else {
         root[n] = fn;
         return fn;
      }
   }

   function ViewModel(name, fn) {
      fn.prototype = Object.create(fn.prototype, {
         _typeName: {
            value: name
         },
         _type: {
            value: 'ViewModel'
         }
      });
      fn.constructor = fn;
      this.cache[this._typeName][name] = fn;
      return nestedScope(name, fn, this._typeName);
   }

   function Service(name, fn) {
      fn.prototype = Object.create(fn.prototype, {
         _typeName: {
            value: name
         },
         _type: {
            value: 'Service'
         }
      });
      fn.constructor = fn;
      this.cache[this._typeName][name] = fn;
      return nestedScope(name, fn, this._typeName);
   }

   function inject(fn) {
      // inject stuff defined as arguments to fn
      var
      o = this,
         dep = this.cache[this._typeName],
         target = fn,
         rx_args = /^function\s*[^\(]*\(\s*([^\)]*)\)/mi,
         text = target.toString(),
         args = text.match(rx_args)[1].split(','),
         expandedArguments = expandAndResolveArgumentsFromFunctionString(args, o);

      // use the construct() fn to new up the resource with a correct prototype chain and arguments that are to be injected
      return !args.length || !args[0] ? new target() : construct(target, expandedArguments)

   }

   function typeResolver(svc, rootElement){
         
         var instance = this,
             requestedType = shitApps[instance._typeName][svc];

         // dependecy injection
         if ( !requestedType ) return;

         // if already an instance return existing. else ask inject to new it up
         var target = isInstance(requestedType)  ?
                        requestedType :
                        requestedType = inject.call(instance, requestedType);

         // in case it's a viewmodel. let root-app databind it.
         if (target._type === "ViewModel") 
            instance.databind.call(instance, target, rootElement);

         return target;
      
   }

   function resolveByDataAttributes() {

      var instance = this;
         // parse the DOM for data-view and data-app on dom ready
         if (instance.resolved) return;
         
         [].slice.call(document.querySelectorAll("[data-view]")).forEach(function(el) {
            var vm = el.getAttribute("data-view");
            if (!vm || !vm.length) return;
            el.dataset.viewmodel = instance.resolve(vm, el);
         });
         
         instance.resolved = true;

   }

   function createDefaultApplicationProperties(applicationType, appName, instance){      
      applicationType.prototype.inject = applicationType.prototype.inject || [];
      applicationType.prototype.databind = applicationType.prototype.databind || function() {};
      applicationType.prototype.activate = applicationType.prototype.activate || function() {};
      applicationType.prototype.ViewModel = ViewModel.bind(instance);
      applicationType.prototype.Service = Service.bind(instance);
      applicationType.prototype.cache = applicationType.prototype.cache || {};
      applicationType.prototype.cache[appName] = {};
      applicationType.prototype.resolved = false;
      applicationType.prototype.resolve = typeResolver.bind(instance);
   }

   function injectAppScopeDependenciesFor(instance){
      instance.inject.forEach(function(res) {
         instance.resolve(res);
      });
   }

   var Application = function(nameOrProt, proto) {

      var 
         instance, 
         applicationName, 
         actualPrototype, 
         applicationType = function() {};
      
      if (typeof(nameOrProt) === "string") {
         // name, prototype passed in
         applicationName = nameOrProt;
         actualPrototype = proto;
      } else {
         // only proto passed in, use a default app name
         applicationName = !root.document ? "$Application" : (root.document.querySelector("[data-app]").getAttribute("data-app") || "$Application");
         actualPrototype = nameOrProt;
      }

      applicationType.prototype = actualPrototype;

      instance = new appScope(applicationName, applicationType);
      
      createDefaultApplicationProperties(applicationType, applicationName, instance);
      
      if(isInitializing === true)
            return instance;
      
      injectAppScopeDependenciesFor(instance);

      instance.activate.call(instance, instance.cache[applicationName]);
            
      window.addEventListener('DOMContentLoaded', resolveByDataAttributes.bind(instance) , false);
      
      return instance;
   }

   return function addLibraryToRuntime() {
      isInitializing = true;
      root.$hit = Application(function() {});
      root.$hit.Application = Application;
      isInitializing = false;
      
      if (window && window.define && window.define.amd) window.define("shitjs", [], function() {
         return root;
      });
      
      return root;

   }();

}(window);