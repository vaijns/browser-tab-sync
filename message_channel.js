import { message_type, message_event } from "./message.js";

/**
	* @template {T} [T=any]
	* @callback addEventListenerCallback
	* @param {message_channel} this
	* @param {message_event<T>} ev
	* @returns {any}
*/

export class message_channel extends EventTarget{
	/** @type{BroadcastChannel} */
	#channel;

	/** @type{((this: message_channel, ev: message_event) => any) | null} */
	on_message;

	/**
		* @template {T} [T=any]
		* @param {message_type[keyof message_type]} type
		* @param {addEventListenerCallback<T>} listener
		* @param {boolean | AddEventListenerOptions} options
	*/
	addEventListener(type, listener, options = false){
		super.addEventListener(type, listener, options);
	}

	/**
		* @description only send event to others 
		* @template {T} [T=any]
		* @param {message_type[keyof message_type]} type
		* @param {T} data
	*/
	send_remote(type, data = undefined){
		this.#channel.postMessage({ type: type, data: data });
	}

	/**
		* @description only send event to ourselves 
		* @template {T} [T=any]
		* @param {message_type[keyof message_type]} type
		* @param {T} data
	*/
	send_local(type, data = undefined){
		this.#fire_message_event(type, data, false);
	}

	/**
		* @description send event to both, others and ourselves
		* @template {T} [T=any]
		* @param {message_type[keyof message_type]} type
		* @param {T} data
	*/
	send_global(type, data = undefined){
		this.#fire_message_event(type, data, false);
		this.#channel.postMessage({ type: type, data: data });
	}

	constructor(channel_name){
		super();
		this.#channel = new BroadcastChannel(channel_name);
		this.#channel.addEventListener("message", (e) =>{
			const msg = e.data;
			this.#fire_message_event(msg.type, msg.data, false);
		});
	}

	/**
		* @template {T} [T=any]
		* @param {message_type[keyof message_type]} type
		* @param {boolean} [bubbles=false]
		* @param {T | undefined} [data=undefined] 
	*/
	#fire_message_event(type, data = undefined, bubbles = false){
		const detail = data ? { type: type, data: data } : { type: type };
		this.dispatchEvent(
			new CustomEvent(type, {
				bubbles: bubbles,
				detail: detail
			})
		);
	}
}
