import * as React from 'react';
import { observer } from 'mobx-react';
import { MobxStoreMutableIface } from '../stores/default-store';
import { preciseMath } from '../../ts/global/Utils';

interface InputMobxProps {
	bind: [
		MobxStoreMutableIface<{}>,
		string,
		...string[]
	];
	transform?: 'infer'|'number'|'int'|'float'|'string';
}

@observer
export class InputMobx extends React.Component<React.InputHTMLAttributes<HTMLInputElement> & InputMobxProps> {
	
	static defaultProps: Partial<InputMobxProps> = {
		transform: 'infer',
	};
	
	get store(): InputMobxProps['bind'][0] {
		return this.props.bind[0];
	}
	
	get bindPath(): string[] {
		return [...this.props.bind].filter((v, i) => i !== 0) as string[];
	}
	
	get value() {
		const bindPath = this.bindPath;
		let curr: any = this.store;
		for (const bindI in bindPath) {
			const bindPiece = bindPath[bindI];
			if (bindPiece in curr) {
				curr = curr[bindPiece];
				if (typeof curr !== 'object' || curr === null) {
					return curr;
				}
			}
		}
		return null;
	}
	
	setValue = (newValue: any) => {
		const bindPath = this.bindPath;
		
		if (bindPath.length === 1) {
			// Simple value update
			this.store.mutate({ [ bindPath[0] ]: newValue });
		}
		else {
			// Nested object update
			
			const baseObj = JSON.parse(JSON.stringify(this.store[bindPath[0]]));
			let curr: any = baseObj;
			
			for (let i = 0; i < bindPath.length; i++) {
				const bindPiece = bindPath[i];
				if (bindPiece in curr) {
					if (typeof curr[bindPiece] !== 'object' || curr[bindPiece] === null) {
						curr[bindPiece] = newValue;
						break;
					}
					else {
						curr = curr[bindPiece];
					}
				}
			}
			
			this.store.mutate({ [bindPath[0]]: baseObj });
		}
	};
	
	onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.currentTarget.value;
		const nVal = InputMobx.transformValue(val, this.props.transform, this.props.type);
		this.setValue(nVal);
	};
	
	static transformValue(value: string | any, transformType: InputMobxProps['transform'], inputType?: string): string|number {
		transformType = transformType || 'infer';
		if (transformType === 'infer') {
			if (inputType === 'number') {
				transformType = 'float';
			}
			else {
				// Fallback to string
				transformType = 'string';
			}
		}
		switch (transformType) {
			case 'int': // fallthrough
			case 'number': {
				return parseInt(value);
			}
			case 'float': {
				return preciseMath(`${value} + 0.00`);
			}
			case 'string': {
				return value.toString();
			}
		}
	}
	
	render() {
		const props = {...this.props};
		props.onChange = this.onChange;
		props.defaultValue = `${this.value}`;
		delete props.bind;
		delete props.transform;
		return <input {...props} />;
	}
	
}
