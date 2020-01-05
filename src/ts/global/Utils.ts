
import * as d3 from 'd3-format';
import { diff } from 'deep-diff';
import { create, all, MathJsStatic } from 'mathjs';

export async function wait(timeMs: number): Promise<void> {
	await (new Promise(resolve => (
		setTimeout(() => {
			resolve();
		}, timeMs)
	) ));
	return;
}

export function arrayUniq<T>(x: T[]): T[] {
	// From https://github.com/sindresorhus/array-uniq/blob/53115b58c511eb7cb408b0ae6fdaaf10ef979601/index.js
	// and here https://stackoverflow.com/a/17903018/5169684
	return Array.from(new Set(x));
}

export function formatPhoneNumber(phoneNumber: string, country: 'United States'|'USA'|string) {
	
	if (!/^\s*U\.?S\.?A\.?|United\s*States/.test(country)) {
		return phoneNumber;
	}
	
	let fPhoneNumber = phoneNumber.trim();
	const usaPhoneNumberRegex = /^1?\(?(\d{3})[\)\- ]?(\d{3})[\- ]?(\d{4})$/;
	
	if (usaPhoneNumberRegex.test(phoneNumber)) {
		const matches = phoneNumber.match(usaPhoneNumberRegex) || [];
		if (matches.length >= 3) {
			fPhoneNumber = `(${matches[1]}) ${matches[2]}-${matches[3]}`;
		}
	}
	
	return fPhoneNumber;
}

// d3 aliases. Documentation: https://www.npmjs.com/package/d3-format
export const formatDollarValue = d3.format(".2f");

export interface NestedDeepObjMutateInterface<T> {
	(changedData: Partial<T>): void;
	
	<P1 extends keyof T>(changedData: Partial< T[P1] >, ...path: [P1]): void;
	
	<P1 extends keyof T, P2 extends keyof T[P1]>(changedData: Partial< T[P1][P2] >, ...path: [P1, P2]): void;
	
	<P1 extends keyof T,
		P2 extends keyof T[P1],
		P3 extends keyof T[P1][P2],
	>(changedData: Partial< T[P1][P2][P3] >, ...path: [P1, P2, P3]): void;
	
	<P1 extends keyof T,
		P2 extends keyof T[P1],
		P3 extends keyof T[P1][P2],
		P4 extends keyof T[P1][P2][P3],
	>(changedData: Partial< T[P1][P2][P3][P4] >, ...path: [P1, P2, P3, P4]): void;
	
	<P1 extends keyof T,
		P2 extends keyof T[P1],
		P3 extends keyof T[P1][P2],
		P4 extends keyof T[P1][P2][P3],
		P5 extends keyof T[P1][P2][P3][P4],
	>(changedData: Partial< T[P1][P2][P3][P4][P5] >, ...path: [P1, P2, P3, P4, P5]): void;
	// etc.
	
	// Cap (for now) to allow type inferrence to work on the above generics
	(changedData: never, ...path: (string|number)[]): void;
}

/* Deep-clone nested object mutation helper function
 * Creates an entirely new object based on the source object with changed data overlayed while having no pointers to the source objects.
 * Usage example:
const sourceObj = { a: {b: {c: 'foo'} }, d: 'bar' };
const changedData =        {c: 'baz'};
const deepCopiedMutatedObj = mut(sourceObj, changedData, 'a', 'b'); // { a: {b: {c: 'baz'} }, d: 'bar' }
*/
export function nestedDeepObjMutate< S extends { [key: string]: any }, C extends Partial<S> >(sourceData: S, changedData: C, ...path: (string|number)[]): S&C {
	/* Apparently, using Generics for this function causes sourceData and changedData to have to be hinted as {} types
	   or the spread syntax throws an error. See:
		 Recent issue - https://github.com/Microsoft/TypeScript/issues/22687
		 Initial issue - https://github.com/Microsoft/TypeScript/issues/10727
		 Proposed (at time of writing) fix - https://github.com/Microsoft/TypeScript/pull/13288
	*/
	const pathLen = path.length;
	
	if (pathLen > 0) {
		let currLevel = (sourceData as {});
		let levelArr = [currLevel];
		
		for (let i = 0; i < pathLen; i++) {
			let key = path[i];
			currLevel = currLevel[key];
			levelArr[i+1] = currLevel;
		}
		
		// Dereference
		let finalLevel = {...currLevel};
		
		Object.entries(changedData).forEach(([key, val]) => {
			finalLevel[key] = val;
		});
		
		// Work backwards through the object tree from the right to the left, dereferencing and overloading the previous value at each step
		const currLevelChangedData = finalLevel;
		let backwardsForwards = currLevelChangedData;
		
		for (let i = (pathLen - 1); i >= 0; i--) {
			let key = path[i];
			backwardsForwards = {...levelArr[i], [key]: backwardsForwards};
		}
		
		// Done - proceed with standard operation
		changedData = backwardsForwards as S&C;
	}
	
	return changedData as S&C;
};

type QuickCloneDeepObjectType = { [prop: string]: QuickCloneDeepObjectType|number|string|boolean|null };

export function quickDeepCloneObject<T extends {} = QuickCloneDeepObjectType>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

/* The purpose of this class is to assist with improving React rendering performance for inline anonymous functions by hashing the function
 * body and retaining the instance of that function, then returning the same instance every time it is used.
 * See https://cdb.reacttraining.com/react-inline-functions-and-performance-bdff784f5578 for one writeup on the subject.
 * This can be used like this:
class Foo extends React.Component<{}, {}> {
	...
	funcPointerStore = new AnonymousFunctionPointerStore();
	render() {
		const g = this.funcPointerStore.getFuncPointer;
		return (<div>
			<button onClick={g( (e: React.ChangeEvent<HTMLInputElement>) => alert(e.currentTarget.innerText) )}>Hello World</button>
		</div>);
	}
}
 * Another option would be to instantiate it in a common component and pass it in as a prop.
 * NOTE: Do not use variables other than those passed into scopedVars or you may receive a function that is stale
 */
export class AnonymousFunctionPointerStore {
	
	private generatedFunctionStore: { [functionBodyAndScopedVars: string]: Function } = {};
	
	getFuncPointer = <T extends Function>(func: T, scopedVars?: any[]|{ [key: string]: any }|string|number|boolean): T => {
		// The purpose of this method is to reduce re-rendering unnecessarily by re-using function instances with the same body
		const funcBody = `${func.toString()}++${ JSON.stringify(scopedVars) }`;
		this.generatedFunctionStore[funcBody] = this.generatedFunctionStore[funcBody] || func;
		return (this.generatedFunctionStore[funcBody] as T);
	}
	
}

// export const diffObject = <T1 extends {}, T2 extends T1>(mutObj: T1, sourceObj: T2): null|Partial<T1> => {
// 	const diffRes = Object.keys(mutObj)
// 		.map(propKey => ({key: propKey, data: shallowDiffObject(mutObj[propKey] as {}, sourceObj[propKey])}))
// 		.filter(item => item.data !== null)
// 		.reduce(
// 			(carry: null|{}, item) => {
// 				const {key, data} = item;
// 				carry = (carry || {});
// 				carry[key] = data;
// 				return carry;
// 			},
// 			null
// 		);
// 	console.log(diffRes);
// 	return diffRes;
// };
// 
// const shallowDiffObject = <T1 extends {}, T2 extends T1>(mutObj: T1, sourceObj: T2): null|Partial<T1> => Object.keys(mutObj)
// 	.filter(key => mutObj[key] !== sourceObj[key])
// 	.map(key => ({key: key, prev: sourceObj[key], curr: mutObj[key]}))
// 	.reduce(
// 		(carry: null|{}, item) => {
// 			const {key, ...props} = item;
// 			carry = (carry || {});
// 			carry[key] = props;
// 			return carry;
// 		},
// 		null
// 	);

export const diffObject = <T1 extends {}, T2 extends T1>(mutObj: T1, sourceObj: T2): null|Partial<T1> => {
	const diffRes = diff(sourceObj, mutObj);
	if (typeof diffRes === 'undefined') {
		// This is undefined if there were no differences but unfortunately it's not in the @types definition
		return null;
	}
	return diffObjectReassemblePath(diffRes);
};

const diffObjectReassemblePath = (iDiff: { kind: string; path: (string|number)[]; lhs: any; rhs: any; }[]) => {
	/*
	INPUT: [ {kind: 'E', path: ['flags', 'repeat_order'], lhs: false, rhs: true} ]
	OUTPUT: { flags: { repeat_order: { prev: false, curr: true } } }
	*/
	let ret = {};
	
	iDiff.forEach(diffItem => {
		
		if (diffItem.path.length === 0) {
			// I would be surprised if this happened
			return;
		}
		
		let lastRef = ret;
		
		diffItem.path.forEach((key, i) => {
			lastRef[key] = lastRef[key] || ( diffItem.path.length !== (i+1) ? {} : { prev: diffItem.lhs, curr: diffItem.rhs } );
			lastRef = lastRef[key];
		});
		
	});
	
	return ret;
}

export const appendElToHead = (type: 'script' | 'stylesheet', uri: string, attr?: Partial<HTMLElement>, timeoutMs = 20000) => {
	return (new Promise((resolve, reject) => {
		
		const el = document.createElement((type === 'script' ? 'script' : 'link'));
		let done = false;
		
		el.onload = () => { if (done) {return;} done = true; resolve(); };
		
		if (el instanceof HTMLScriptElement) {
			el.src = uri;
		}
		else {
			el.rel = 'stylesheet';
			el.type = 'text/css';
			el.href = uri;
		}
		
		if (attr) {
			Object.entries(attr).map(([key, val]) => el[key] = val);
		}
		
		document.head.appendChild(el);
		
		setTimeout(() => { if (done) { return; } done = true; reject(); }, timeoutMs);
		
	}));
};

export function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
    return input != null;
}

export function isNotFalsey<T>(input: null|undefined|false|''|0|T): input is T {
    return !!input;
}

export function coalesceUndefined<T, R extends Exclude<T, undefined>>(val: T|undefined, defaultVal: R): R {
	return (typeof val !== 'undefined' ? val as R : defaultVal);
}

export const mathjsBn64 = create(all, {
	number: 'BigNumber', // Default type of number: 'number' (default), 'BigNumber', or 'Fraction'
	precision: 64        // Number of significant digits for BigNumbers
}) as MathJsStatic;

export function preciseMath(mathExpression: string, asString?: false): number;
export function preciseMath(mathExpression: string, asString: true): string;
export function preciseMath(mathExpression: string, asString: boolean = false): number|string {
	const result = mathjsBn64.evaluate(mathExpression);
	return (asString ? result.toString() : parseFloat(result));
}
