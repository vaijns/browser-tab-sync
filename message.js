/** @template {T}[T=any] */
export class message_event{
	/** @type{message_type[keyof message_type]} */
	#type;
	/** @returns{message_type[keyof message_type]} */
	get type(){
		return this.#type;
	}

	/** @type{T | undefined} */
	#data;
	/** @returns{T | undefined} */
	get data(){
		return this.#data;
	}

	/**
		* @param {message_type[keyof message_type]} type
		* @param {T | undefined} data
	*/
	constructor(type, data = undefined){
		this.#type = type;
		this.#data = data;
	}
}

export const message_type = Object.freeze({
	channel_open: "channel.open",
	channel_close: "channel.close",
	data_sync_request: "data.sync.request",
	data_sync_ack: "data.sync.acknowledge",
	data_add: "data.add",
	debug: "debug"
});