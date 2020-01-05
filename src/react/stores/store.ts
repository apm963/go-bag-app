
import { action, observable, flow } from 'mobx';
import { MobxStoreMutable, MobxDomainStoreMutable } from './default-store';
import { wait } from '../../ts/global/Utils';
//import { preciseMath } from '../../ts/global/Utils';



export interface User {
	ID: number;
	email: string;
	f_name: string;
	l_name: string;
	sms_number: string;
}

export interface Bag {
	ID: number;
	type: string;
	owner_ID: number;
	location: string;
	template: string;
	visibility: 'private'|'public';
	cover_image: string;
	description: string;
	components: BagComponent[];
}

interface BagComponent extends Component {
	added_datetime: string;
	packed_datetime: string;
	expiration_datetime: string;
}

interface Component {
	ID: number;
	brand: string;
	model: string;
	color: string;
	sku: string;
	msrp: number;
	discontinued: boolean;
	disabled: boolean;
	shelf_life_days: number;
	urls: ComponentUrl[];
	classifiers: ComponentClassifer[];
}

interface ComponentClassifer {
	ID: number;
	name: string;
}

interface ComponentUrl {
	ID: number;
	component_ID: number;
	url: string;
	site_ID: number;
	price: number;
	commission_perc: string;
}


interface MockData {
	user: User;
	bags: Bag[];
}

const mockData: MockData = {
	user: {
		ID: 1,
		f_name: 'Adam',
		l_name: 'Mazzarella',
		email: 'amadf@jkasldjflk',
		sms_number: '',
	},
	bags: [
		{
			ID: 1,
			type: '72-hour bag',
			owner_ID: 1,
			location: 'Bedroom',
			template: 'custom',
			visibility: 'public',
			cover_image: 'https://cdn2.iconfinder.com/data/icons/backpacks-handbags-purse-1/67/15-512.png',
			description: 'Test',
			components: [
				{
					ID: 1,
					brand: 'Test brand',
					model: 'Test model',
					color: 'Green',
					sku: '12345',
					msrp: 12.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 12,
					urls: [{ID: 1, url: 'https://example.com/', commission_perc: '10', price: 10.00, site_ID: 1, component_ID: 1}],
					classifiers: [{ID: 1, name: 'Food'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
				{
					ID: 2,
					brand: 'Test brand2',
					model: 'Test model2',
					color: 'Brown',
					sku: '984564',
					msrp: 1012.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 365,
					urls: [{ID: 2, url: 'https://example.com/', commission_perc: '10', price: 1040.00, site_ID: 1, component_ID: 2}],
					classifiers: [{ID: 2, name: 'Tool'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
			],
		},
		{
			ID: 2,
			type: '72-hour bag',
			owner_ID: 1,
			location: 'Robbie\'s Bedroom',
			template: 'custom',
			visibility: 'public',
			cover_image: 'https://cdn1.iconfinder.com/data/icons/camping-hiking-thick-line-1/100/camping_bw_2px-33-512.png',
			description: 'Test',
			components: [
				{
					ID: 1,
					brand: 'Test brand',
					model: 'Test model',
					color: 'Green',
					sku: '12345',
					msrp: 12.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 12,
					urls: [{ID: 1, url: 'https://example.com/', commission_perc: '10', price: 10.00, site_ID: 1, component_ID: 1}],
					classifiers: [{ID: 1, name: 'Food'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
				{
					ID: 2,
					brand: 'Test brand2',
					model: 'Test model2',
					color: 'Brown',
					sku: '984564',
					msrp: 1012.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 365,
					urls: [{ID: 2, url: 'https://example.com/', commission_perc: '10', price: 1040.00, site_ID: 1, component_ID: 2}],
					classifiers: [{ID: 2, name: 'Tool'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
			],
		},
		{
			ID: 3,
			type: '72-hour bag',
			owner_ID: 1,
			location: 'Bedroom',
			template: 'custom',
			visibility: 'public',
			cover_image: 'https://cdn1.iconfinder.com/data/icons/camping-hiking-thick-line-1/100/camping_bw_2px-33-512.png',
			description: 'Test',
			components: [
				{
					ID: 1,
					brand: 'Test brand',
					model: 'Test model',
					color: 'Green',
					sku: '12345',
					msrp: 12.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 12,
					urls: [{ID: 1, url: 'https://example.com/', commission_perc: '10', price: 10.00, site_ID: 1, component_ID: 1}],
					classifiers: [{ID: 1, name: 'Food'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
				{
					ID: 2,
					brand: 'Test brand2',
					model: 'Test model2',
					color: 'Brown',
					sku: '984564',
					msrp: 1012.99,
					discontinued: false,
					disabled: false,
					shelf_life_days: 365,
					urls: [{ID: 2, url: 'https://example.com/', commission_perc: '10', price: 1040.00, site_ID: 1, component_ID: 2}],
					classifiers: [{ID: 2, name: 'Tool'}],
					added_datetime: '2020-01-04 00:00:00',
					packed_datetime: '0000-00-00 00:00:00',
					expiration_datetime: '0000-00-00 00:00:00',
				},
			],
		}
	],
};








export class RootStore extends MobxStoreMutable<RootStore> {
	//userStore = new UserStore(this);
	userInventoryStore = new UserInventoryStore(this);
}

export class UserInventoryStore extends MobxDomainStoreMutable<UserInventoryStore, RootStore> {
	
	@observable bags: null | (Bag[]) = null;
	
	@action load = flow(function* (this: UserInventoryStore) {
		yield wait(500);
		this.bags = mockData.bags;
		//setInterval(() => this.robbieIsAFart(), 2000);
	});
	
	// @action robbieIsAFart = () => {
	// 	if (this.bags) {this.bags[1].location += ' 💨';}
	// };
	
	//hmrRestore = (objectData: Partial<this>) => {
	//	if (objectData.orderData) {
	//		this.setOrderData(objectData.orderData as OrderData);
	//	}
	//};
	
	//@action addBag = () => {
	//	if (!this.bags) {
	//		this.bags = [];
	//	}
	//	this.bags.push({});
	//};
	
}

/*
export class LineitemStore extends MobxDomainStoreMutable<LineitemStore, RootStore> implements OrderLineitemData {
	
	@observable sku = '';
	@observable color = '';
	@computed get qty() { return Object.values(this.size_qty).reduce((carry, item) => {return carry + item;}, 0); };
	//@observable qty = 0;
	@observable size_qty: OrderLineitemData['size_qty'] = {};
	@observable price = 0;
	@computed get total() { return preciseMath(`${this.price} * ${this.qty}`); }
	
	@observable _newSize = '';
	
	@action addSize = (): boolean => {
		if (!this._newSize) {
			return false;
		}
		this.size_qty[ this._newSize.trim().toUpperCase() ] = 0;
		return true;
	};
	
}
*/
