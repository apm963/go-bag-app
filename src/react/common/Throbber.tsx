import * as React from 'react';
import { css } from 'emotion';
import { XOR } from '../../ts/global/Types';
import { coalesceUndefined } from '../../ts/global/Utils';

// Styles from https://loading.io/css/

type ColorPaletteColors = 'white'|'pink'|'beige'|'green'|'blue'|'purple'|'black';

type ColorPaletteInterface = { [color in ColorPaletteColors]: string };

const colorPaletteDefault: ColorPaletteInterface = {
	white: '#fff',
	pink: '#fdd',
	beige: '#fed',
	green: '#dfc',
	blue: '#cef',
	purple: '#fcf',
	black: '#ddd',
};

function buildPaletteTheme(props: { [color in keyof ColorPaletteInterface]?: string }): ColorPaletteInterface {
	return {
		white: props.white || colorPaletteDefault.white,
		pink: props.pink || colorPaletteDefault.pink,
		beige: props.beige || colorPaletteDefault.beige,
		green: props.green || colorPaletteDefault.green,
		blue: props.blue || colorPaletteDefault.blue,
		purple: props.purple || colorPaletteDefault.purple,
		black: props.black || colorPaletteDefault.black,
	};
}

export const colorPalette: { [theme: string]: ColorPaletteInterface } = {
	default: colorPaletteDefault,
	light: colorPaletteDefault,
	//example: buildPaletteTheme({blue: '#60caff', black: '#636363'}),
};

function getColorVal(colorHex: string|null, theme: string|undefined|null|false, color: string|undefined|null|false): string {
	const defaultTheme = 'default';
	const defaultColor: keyof ColorPaletteInterface = 'blue';
	theme = theme || defaultTheme;
	color = color || defaultColor;
	return (
		colorHex
		|| (theme in colorPalette && (colorPalette[theme][color] || colorPalette[theme][defaultColor]))
		|| colorPalette[defaultTheme][defaultColor]
	);
}

interface DualRingPropsBase {
	size?: string; // "46px"
	borderSize?: string; // "5px"
}

interface DualRingPropsEmpty extends DualRingPropsBase { }

interface DualRingPropsColor extends DualRingPropsBase {
	colorHex: string;
}

interface DualRingPropsPalette extends DualRingPropsBase {
	theme: string;
	color: ColorPaletteColors;
}

export class DualRing extends React.Component<XOR<DualRingPropsEmpty, XOR<DualRingPropsColor, DualRingPropsPalette>>, {}> {
	
	style = {
		spinner: ({colorHex: color, size, borderSize}: Partial<DualRingPropsColor>) => {
			const colorHex = getColorVal(color || null, 'theme' in this.props && this.props.theme, 'color' in this.props && this.props.color);
			size = coalesceUndefined(size, '46px');
			borderSize = coalesceUndefined(borderSize, '5px');
			return css`
				display: block;
				&::after {
					content: " ";
					display: block;
					width: ${size};
					height: ${size};
					margin: 1px;
					border-radius: 50%;
					border: ${borderSize} solid ${colorHex};
					border-color: ${colorHex} transparent ${colorHex} transparent;
					animation: lds-dual-ring 1.2s linear infinite;
				}
				@keyframes lds-dual-ring {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`;
		},
	};
	
	render() {
		return <div className={this.style.spinner(this.props)} />;
	}
	
}
