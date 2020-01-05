// From: https://medium.com/@dmyl/mixins-as-class-decorators-in-typescript-angular2-8e09f1bc1f02
// and: https://plnkr.co/edit/of5JJMH6GV0vWykc5UIs?p=info
export function Mixin(baseCtors: /*Function*/any[]) {
	return (derivedCtor: /*Function*/any) => {
		baseCtors.forEach(baseCtor => {
			Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
				const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
				
				if (name === 'constructor') { return; }
				
				if (descriptor && (!descriptor.writable || !descriptor.configurable || !descriptor.enumerable || descriptor.get || descriptor.set)) {
					Object.defineProperty(derivedCtor.prototype, name, descriptor);
				}
				else {
					derivedCtor.prototype[name] = baseCtor.prototype[name];
				}
				
			});
		});
	};
}