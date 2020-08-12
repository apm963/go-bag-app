import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import { RootStore } from './stores/store';
import { configure } from 'mobx';

configure({ enforceActions: "observed" });

const store = new RootStore();

async function main() {
	
	// NOTE: This is done here instead of in module.hot.accept because that runs after that components have mounted
	if ('_hmr' in (window as any)) {
		if ('storeJsonPromise' in (window as any)._hmr && (window as any)._hmr.storeJsonPromise) {
			await (window as any)._hmr.storeJsonPromise;
		}
		if ('storeJson' in (window as any)._hmr && (window as any)._hmr.storeJson) {
			store.fromJson((window as any)._hmr.storeJson);
		}
	}
	
	// @ts-ignore
	window.debugStore = store; // DEBUG
	
	// Init store
	// TODO: Init store if needed
	
	try {
		ReactDOM.render(
			<App rootStore={store} />,
			document.getElementById('root') as HTMLElement
		);
	}
	catch (err) {
		console.error(err);
	}
	
}

main();

const tempModule = module as any | { hot?: unknown };

if (tempModule && 'hot' in tempModule && (tempModule as {hot?: unknown}).hot) {
	
	interface WindowHmrIface {
		loaded?: boolean;
		origBodyStyle?: CSSStyleDeclaration;
		origBodyMarginPadding?: number;
		indicatorInterval?: NodeJS.Timeout;
		storeJson?: string;
		storeJsonPromise?: Promise<true>;
		stats?: {
			hmrStart: number;
			storeRehydrateStart: number;
		};
	}
	
	const windowTyped: Window & { _hmr: WindowHmrIface } = window as any;
	
	if (!windowTyped._hmr) {
		// Set up so pointer works
		windowTyped._hmr = {};
	}
	
	const windowHmr = windowTyped._hmr;
	const defaultStats = {
		hmrStart: 0,
		storeRehydrateStart: 0,
	};
	
	windowHmr.loaded = windowHmr.loaded || true;
	windowHmr.stats = windowHmr.stats ?? defaultStats;
	
	const hmrIndicator = (status: 'loading'|'error'|'complete') => {
		
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
		
		const rgba: [number, number, number, number] = (
			status === 'complete'
			? [0, 188, 212, 1]
			: (
				status === 'loading'
				? [177, 177, 82, 1]
				: [177, 82, 82, 1] // error
			)
		);
		
		bodyEl.style.margin = '0';
		bodyEl.style.padding = `${bodyMarginPadding / 2}px`;
		bodyEl.style.border = `${bodyMarginPadding / 2}px solid rgba(${rgba.join(', ')})`;
		
		// If an interval is already mid-stream transitioning, cancel it and restart
		if (windowHmr.indicatorInterval) {
			clearInterval(windowHmr.indicatorInterval);
		}
		
		if (status !== 'complete') {
			// We only want 'complete' to fade away
			return;
		}
		
		// TODO: Probably make this a CSS transition for GPU acceleration (among other things)
		windowHmr.indicatorInterval = setInterval(() => {
			
			rgba[3] -= 0.006; // This number [alpha] is from tweaking
			bodyEl.style.borderColor = `rgba(${rgba.join(', ')})`;
			
			if (rgba[3] <= 0.0) {
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
	
	(module as any).hot.dispose(() => {
		// module is about to be replaced
		
		windowHmr.stats && (windowHmr.stats.hmrStart = Date.now());
		
		hmrIndicator('loading');
		
		const oldStore = store;
		
		windowHmr.storeJsonPromise = new Promise(resolve => setTimeout(() => {
			windowHmr.stats && (windowHmr.stats.storeRehydrateStart = Date.now());
			windowHmr.storeJson = oldStore.toJson();
			hmrIndicator('complete');
			windowHmr.storeJsonPromise && windowHmr.storeJsonPromise.then(() => delete windowHmr.storeJsonPromise);
			return resolve(true);
		}, 0));
		
	});
	
	(module as any).hot.accept(async () => {
		// module or one of its dependencies was just updated
		const hmrEnd = Date.now() - (windowHmr.stats?.hmrStart ?? 0);
		if (!windowHmr.storeJsonPromise) {
			hmrIndicator('complete');
		}
		else {
			await windowHmr.storeJsonPromise;
		}
		const storeRehydrateEnd = Date.now() - (windowHmr.stats?.storeRehydrateStart ?? 0);
		console.debug(`HMR stats: module ${hmrEnd}ms + store ${storeRehydrateEnd}ms = total ${hmrEnd + storeRehydrateEnd}ms @${moment().format('HH:mm:ss')}`);
		windowHmr.stats = defaultStats;
	});
	
}
