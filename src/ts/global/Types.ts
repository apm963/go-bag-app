
export type EmptyArray = never[];
export type BooleanInt = 0|1;
export type BooleanStr = '0'|'1';

export type DbArrayRow<T> = { [key in keyof T]: string; };

/* This can assist with abstracting overall properties that don't need to be used
 * within child components and can allow for decoupling components for reusability. Usage example:

// In a parent
interface Everything = {foo: string; bar: number; baz: boolean};
const everything: Everything = {foo: ''; bar: 0; baz: false};

// In a child that only uses 'foo' and 'bar' and doesn't need the other props
type SpecifiedObjKeys = SpecifiedPartial<Everything, 'foo'|'bar'>;
const childStuff: SpecifiedObjKeys = everything;
console.log( childStuff.bar ); // OK: 0
console.log( childStuff.baz ); // Type error
*/
export type SpecifiedPartial<T extends { [key: string]: any }, S extends keyof T> = {
	[P in S]: T[P];
}

// From https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#type-inference-in-conditional-types
export type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

// From https://stackoverflow.com/a/49286056
export type ValueOf<T> = T[keyof T];

export type FunctionAny = (...args: any[]) => any;

// From https://stackoverflow.com/a/53229857
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

