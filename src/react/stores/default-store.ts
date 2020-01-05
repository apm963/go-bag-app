
import { entries, remove, action } from 'mobx';
import { RootStore } from './store';

export interface MobxStoreMutableIface<U> {
	
	mutate(obj: Partial<U>): void;
	mutate<T extends keyof U>(prop: T, val: U[T]): void;
	mutate<T extends keyof U>(varidic: T | Partial<U>, val?: U[T]): void;
	
	hmrRestore?: (objectData: Partial<U>) => void;
	
	toJson(): string;
	
	fromJson(jsonStr: string): void;
	
}

export abstract class MobxStoreMutable<U> implements MobxStoreMutableIface<U> {
	
	mutate(obj: Partial<U>): void;
	mutate<T extends keyof U>(prop: T, val: U[T]): void;
	@action.bound
	mutate<T extends keyof U>(varidic: T | Partial<U>, val?: U[T]): void {
		const obj: Partial<U> = (typeof varidic === 'object' ? varidic : { [varidic]: val } as Partial<U>);
		Object.entries(obj).forEach(([prop, value]) => {
			const thisProp = this[prop];
			if (thisProp && typeof thisProp === 'object') {
				if (typeof thisProp.clear === 'function') {
					// observable.array type
					thisProp.clear();
				}
				else {
					// observable.object type
					entries(thisProp).forEach(([key]) => remove(this[prop], key));
				}
			}
			this[prop] = value;
		});
	}
	
	toJson(): string {
		
		const encounteredObjects: Object[] = [];
		
		const foo = (obj: Object) => {
			
			encounteredObjects.push(obj);
			
			const newObj = { ...obj };
			
			for (const key in newObj) {
				
				if (!newObj.hasOwnProperty(key)) {
					// Does this happen even if we use spread?
					delete newObj[key];
					continue;
				}
				
				if (typeof newObj[key] === 'function') {
					delete newObj[key];
					continue;
				}
				else if (newObj[key] && typeof newObj[key] === 'object' && 'length' in newObj[key]) {
					// This is an array; treat it as such
					newObj[key] = (newObj[key] as Object[]).map(v => foo(v));
					continue; // No need for further execution on this array
				}
				
				if (newObj[key] instanceof MobxStoreMutable) {
					// This is a mutable store. Copy this as if it were an empty obj.
					newObj[key] = {};
				}
				
				if (newObj[key] && typeof newObj[key] === 'object' && !('length' in newObj[key])) {
					if (!encounteredObjects.includes(obj[key])) {
						newObj[key] = foo(obj[key]);
					}
					else {
						// This is a cyclic property; drop it entirely
						delete newObj[key];
					}
				}
				
			}
			
			return newObj;
		};
		
		const bar = foo(this);
		
		return JSON.stringify(bar);
	}
	
	@action
	fromJson(jsonStr: string) {
		//this.mutate(JSON.parse(jsonStr));
		const parsedData = JSON.parse(jsonStr);
		
		for (let key in parsedData) {
			
			if (!this.hasOwnProperty(key) || !parsedData.hasOwnProperty(key)) {
				continue;
			}
			
			const val = parsedData[key];
			
			if (this[key] instanceof MobxStoreMutable) {
				if ('hmrRestore' in this[key]) {
					// Custom restore logic for this class (can be helpful for arrays of Stores)
					this[key].hmrRestore(val);
				}
				else {
					this[key].mutate(val);
				}
				continue;
			}
			
			// @ts-ignore
			this.mutate(key, val);
			
		}
		
	}
	
}

export abstract class MobxDomainStoreMutable<U, S = RootStore> extends MobxStoreMutable<U> {
	constructor(public rootStore: S) { super(); }
}
