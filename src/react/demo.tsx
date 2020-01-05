import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import { RootStore } from './stores/store';
import { configure } from 'mobx';

configure({ enforceActions: "observed" });

const store = new RootStore();
let hmrStoreLoadResult: null|boolean = null;

if ('_hmr' in (window as any) && 'storeJson' in (window as any)._hmr && (window as any)._hmr.storeJson) {
	try {
		store.fromJson((window as any)._hmr.storeJson);
		hmrStoreLoadResult = true;
	}
	catch (err) {
		console.error(err);
		hmrStoreLoadResult = false;
	}
}

try {
	ReactDOM.render(
		<App rootStore={store} />,
		document.getElementById('root') as HTMLElement
	);
}
catch (err) {
	console.error(err);
}

const tempModule = module as any | { hot?: unknown };

if (tempModule && 'hot' in tempModule && (tempModule as {hot?: unknown}).hot) {
	
	interface WindowHmrIface {
		loaded?: boolean;
		origBodyStyle?: CSSStyleDeclaration;
		origBodyMarginPadding?: number;
		indicatorInterval?: NodeJS.Timeout;
		storeJson?: string;
	}
	
	const windowTyped: Window & { _hmr: WindowHmrIface } = window as any;
	
	if (!windowTyped._hmr) {
		// Set up so pointer works
		windowTyped._hmr = {};
	}
	
	const windowHmr = windowTyped._hmr;
	
	windowHmr.loaded = windowHmr.loaded || true;
	
	const hmrIndicator = (type: 'ok'|'error' = 'ok') => {
		
		const bodyElCollection = document.getElementsByTagName('body');
		if (!bodyElCollection) { return; }
		const bodyEl = bodyElCollection.item(0);
		if (!bodyEl) { return; }
		
		windowHmr.origBodyStyle = windowHmr.origBodyStyle || { ...bodyEl.style };
		windowHmr.origBodyMarginPadding = (
			windowHmr.origBodyMarginPadding
			|| (
				parseFloat(getComputedStyle(bodyEl).getPropertyValue('margin').toString() || '0')
				+ parseFloat(getComputedStyle(bodyEl).getPropertyValue('padding').toString() || '0')
			)
		);
		const origStyle: CSSStyleDeclaration = windowHmr.origBodyStyle;
		const bodyMarginPadding = windowHmr.origBodyMarginPadding;
		
		const borderColor = (type === 'error' ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 188, 212, 1)');
		
		bodyEl.style.margin = '0 auto';
		bodyEl.style.padding = `${bodyMarginPadding / 2}px`;
		bodyEl.style.border = `${bodyMarginPadding / 2}px solid ${borderColor}`;
		
		let alpha = 1.0;
		
		// If an interval is already mid-stream transitioning, cancel it and restart
		if (windowHmr.indicatorInterval) {
			clearInterval(windowHmr.indicatorInterval);
		}
		
		windowHmr.indicatorInterval = setInterval(() => {
			
			alpha -= 0.006; // This number is from tweaking
			bodyEl.style.borderColor = (type === 'error' ? `rgba(255, 0, 0, ${alpha})` : `rgba(0, 188, 212, ${alpha})`);
			
			if (alpha <= 0.0) {
				if (windowHmr.indicatorInterval) {
					clearInterval(windowHmr.indicatorInterval);
				}
				bodyEl.style.margin = origStyle.margin;
				bodyEl.style.padding = origStyle.padding;
				bodyEl.style.border = origStyle.border;
				bodyEl.style.borderColor = origStyle.borderColor;
			}
			
		}, 2); // Very low refresh rate for smoothness
		
	};
	
	(module as any).hot.dispose(function () {
		// module is about to be replaced
		try {
			windowHmr.storeJson = store.toJson();
		}
		catch (err) {
			console.error(err);
		}
	});
	
	(module as any).hot.accept(function () {
		// module or one of its dependencies was just updated
		hmrIndicator(hmrStoreLoadResult === false ? 'error' : 'ok');
	});
	
}
