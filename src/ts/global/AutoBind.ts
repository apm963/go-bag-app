export class AutoBind {
	public autoBind() {
		Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map(key => {
			if (typeof this[key] === 'function' && key !== 'constructor' && key !== 'render' && key !== 'autoBind') {
				this[key] = this[key].bind(this);
			}
		});
	}
}
