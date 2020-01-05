import * as React from 'react';
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
import { css, cx } from 'emotion';
import { observer } from 'mobx-react';
import { RootStore, Bag } from '../stores/store';
//import { Unpacked } from '../../ts/global/Types';

export interface AppStyle {
	root: string;
	bagsContainer: string;
	tabsContainer: string;
	renderedMarkdownContainer: string;
	sendEmailButtonContainer: string;
	workingSpinnerWrapper: string;
}

interface AppProps {
	rootStore: RootStore;
	style?: Partial<AppStyle>;
}

@observer
class App extends React.Component<AppProps> {
	
	get style(): AppStyle {
		return {
			...this.defaultStyle,
			...(this.props.style || {}),
		};
	}
	
	defaultStyle: AppStyle = {
		root: css`
			box-sizing: border-box;
			@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');
			font-family: 'Montserrat';
		`,
		bagsContainer: css`
			display: flex;
			flex-wrap: wrap;
			
			/* Transition */
			.slide-up-appear {
					opacity: 0;
					transform: translateY(10px);
					transition: all 0.5s ease;
					
					&.slide-up-appear-active {
							opacity: 1;
							transform: translateY(0px);
					}
			}
		`,
		tabsContainer: css`
			/* From https://unpkg.com/react-tabs@2.2.2/style/react-tabs.css */
			.react-tabs__tab-list {
				border-bottom: 1px solid #aaa;
				margin: 0 0 10px;
				padding: 0;
			}
			
			.react-tabs__tab {
				display: inline-block;
				border: 1px solid transparent;
				border-bottom: none;
				bottom: -1px;
				position: relative;
				list-style: none;
				padding: 6px 12px;
				cursor: pointer;
			}
			
			.react-tabs__tab--selected {
				background: #fff;
				border-color: #aaa;
				color: black;
				border-radius: 5px 5px 0 0;
			}
			
			.react-tabs__tab--disabled {
				color: GrayText;
				cursor: default;
			}
			
			.react-tabs__tab:focus {
				box-shadow: 0 0 5px hsl(208, 99%, 50%);
				border-color: hsl(208, 99%, 50%);
				outline: none;
			}
			
			.react-tabs__tab-panel {
				display: none;
			}
			
			.react-tabs__tab-panel--selected {
				display: block;
				padding: 0.2em;
				padding-top: 0;
			}
		`,
		renderedMarkdownContainer: css`
			border: 1px solid #aaa;
			background-color: white;
			padding: 0.5em;
		`,
		sendEmailButtonContainer: css`
			margin-top: 0.5em;
		`,
		workingSpinnerWrapper: css`display: inline-block; margin-top: 1px;`,
	}
	
	componentDidMount() {
		
		const { userInventoryStore } = this.props.rootStore;
		
		const { bags } = userInventoryStore;
		
		if (bags === null) {
			userInventoryStore.load();
		}
		
	}
	
	//onAddNewTemplateClick = () => {
	//	const { screenerEmailTemplateEditorStore: store } = this.props.rootStore;
	//	const newTempateId = store.newTemplate();
	//	store.mutateTemplate(newTempateId, { displayName: `New template ${Math.abs(newTempateId)}`});
	//	store.selectTemplate(newTempateId);
	//};
	//
	//onTabChange = (index: number) => {
	//	const { screenerEmailStore } = this.props.rootStore;
	//	screenerEmailStore.changeTab(index);
	//};
	//
	//onFullEditClick = () => {
	//	const { screenerEmailTemplateEditorStore } = this.props.rootStore;
	//	const childTemplateId = screenerEmailTemplateEditorStore.createChildTemplate(screenerEmailTemplateEditorStore.selectedTemplateId);
	//	screenerEmailTemplateEditorStore.selectTemplate(childTemplateId);
	//	// This gets saved when the user triggers the send email function
	//};
	
	render() {
		const { userInventoryStore } = this.props.rootStore;
		const { bags } = userInventoryStore;
		return (
			<div className={this.style.root}>
				<h1>React WIP Go Bag App</h1>
				<div>
					{bags && (
						<ReactCSSTransitionGroup transitionName="slide-up" transitionAppear={true} className={this.style.bagsContainer}>
							{bags.map((bag, i) => <BagComponent key={bag.ID} bag={bag} style={{ transitionDelay: `${i * 0.05}s` }} />)}
						</ReactCSSTransitionGroup>
					)}
				</div>
				{/* <div><button onClick={this.props.rootStore.orderStore.addLineitem}>Add lineitem</button></div> */}
			</div>
		);
	}
	
}



interface BagComponentProps {
	bag: Bag;
	className?: string;
	style?: {[prop: string]: any};
}

@observer
class BagComponent extends React.Component<BagComponentProps> {
	
	style = {
		root: css`
			border: 4px solid black;
			border-top: none;
			margin-right: 10px;
			width: 100px;
			height: 100px;
			cursor: pointer;
			overflow: hidden;
			transition: opacity 0.2s, width 0.2s 0.2s, margin 0.2s 0.2s;
			opacity: 1;
		`,
		bagRemoved: css`opacity: 0; width: 0; margin: 0;`,
		name: css`
			color: white;
			background: black;
			user-select: none;
			margin: 0;
		`,
		cover: css`
			height: 100%;
			width: 100%;
			object-fit: cover;
			user-select: none;
			pointer-events: none;
		`,
	}
	
	render() {
		const {bag} = this.props;
		const rootStyles = [this.style.root];
		if (bag.visibility === 'private') {rootStyles.push(this.style.bagRemoved);}
		return (
			<div className={cx(rootStyles)} style={this.props.style}>
				<p className={this.style.name}>{bag.location} {bag.type}</p>
				<img className={this.style.cover} src={bag.cover_image || "https://cdn2.iconfinder.com/data/icons/backpacks-handbags-purse-1/67/15-512.png"} alt=""/>
			</div>
		);
	}
	
}




/*
interface LineitemProps {
	i: number; // lineitem index
	lineitem: Unpacked<OrderData["lineitems"]>;
	style?: Partial<LineitemStyle>;
}

export interface LineitemStyle {
	root: string;
	sizeQtyContainer: string;
	sizeQtyBreakdown: string;
}

@observer
class Lineitem extends React.Component<LineitemProps> {
	
	get style(): LineitemStyle {
		return {
			...this.defaultStyle,
			...(this.props.style || {}),
		};
	}
	
	defaultStyle: LineitemStyle = {
		root: css`
			display: inline-block;
			margin: 0.5em;
			padding: 1em;
			background-color: white;
			border: 1px solid #aaa;
			border-radius: 3;
		`,
		sizeQtyContainer: css`
			margin: 1em 0;
		`,
		sizeQtyBreakdown: css`
			padding-left: 0.5em;
		`,
	}
	
	render() {
		const l = this.props.lineitem;
		return (
			<div className={this.style.root}>
				<div>{l.qty} <InputMobx type="text" bind={[l, 'color']} placeholder="Color" /> <InputMobx type="text" bind={[l, 'sku']} placeholder="SKU" /></div>
				<div className={this.style.sizeQtyContainer}>
					<div>Sizes</div>
					<div className={this.style.sizeQtyBreakdown}>
						{Object.entries(l.size_qty).map(([key, value]) => (
							<div key={key}>
								<span>{key}</span>
								&nbsp;
								<span><InputMobx type="number" bind={[l, 'size_qty', key]} /></span>
							</div>
						))}
						<div>
							<InputMobx type="text" bind={[l, '_newSize']} placeholder="New size" />
							<button onClick={l.addSize}>Add size</button>
						</div>
					</div>
				</div>
				<div>Price: $<InputMobx type="number" bind={[l, 'price']} transform='float' min={0.01} step={0.01} /></div>
				<div>Total: ${formatDollarValue(l.total)}</div>
			</div>
		);
	}
	
}
*/

export default App;
