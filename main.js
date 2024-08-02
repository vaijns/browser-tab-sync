import { message_channel } from "./message_channel.js";
import { message_type } from "./message.js";
import {
	get_data, set_data,
	get_data_property, set_data_property, change_data_property,
	get_data_priority, set_data_priority,
	set_priority, get_priority,
	channel, main_channel,
	query_params,
} from "./data.js";

function channel_open(e){
	console.debug("open");
}
function channel_close(e){
	const closed_priority = e.detail.data.priority;
	// if the closed window had a higher priority, this window now moves up in priority (lower number)
	if(closed_priority && get_priority() > closed_priority)
		set_priority(get_priority() - 1);
}
// someone asked for up-to-date data
function data_sync_request(e){
	// send our data with the priority level we have
	channel(main_channel).send_remote(message_type.data_sync_ack, { priority: get_priority(), data: get_data() });
}
// we received (hopefully lol) up-to-date data
function data_sync_acknowledge(e){
	// if the sync window had an equal or higher priority (lower number), this window now moves down in priority (higher number)
	if(get_priority() <= e.detail.data.priority)
		set_priority(e.detail.data.priority + 1);
	// if the sync window has higher priority data (lower number), we need to replace our data
	if(e.detail.data.priority < get_data_priority()){
		set_data_priority(e.detail.data.priority);
		set_data(e.detail.data.data);
		Object.entries(get_data()).forEach(([key, val]) => add_item(key, val));
	}
}
function data_add(e){
	const new_data = e.detail.data;
	console.debug(Object.entries(new_data));
	Object.entries(new_data).forEach(([key, val]) => add_item(key, val));
}

function add_item(key, value){
	const new_item_key = document.createElement("dt");
	new_item_key.innerHTML = key;
	const new_item_value = document.createElement("dd")
	new_item_value.innerHTML = value;

	set_data_property(key, value);

	const container = document.querySelector("#container");
	container.appendChild(new_item_key);
	container.appendChild(new_item_value);
}

function startup(){
	channel(main_channel).addEventListener("channel.open", channel_open);
	channel(main_channel).addEventListener("channel.close", channel_close);
	channel(main_channel).addEventListener("data.add", data_add);
	channel(main_channel).addEventListener("data.sync.request", data_sync_request);
	channel(main_channel).addEventListener("data.sync.acknowledge", data_sync_acknowledge);
	channel(main_channel).addEventListener("debug", console.debug);

	channel(main_channel).send_remote(message_type.channel_open);
	channel(main_channel).send_remote(message_type.data_sync_request);

	const add_item_input_container = document.querySelector("#add-item");
	const add_item_btn = add_item_input_container.querySelector("button");
	const add_item_key_input = add_item_input_container.querySelector("input#key");
	const add_item_value_input = add_item_input_container.querySelector("input#value");

	add_item_btn.addEventListener("click", e =>{
		const key = add_item_key_input.value;
		const value = add_item_value_input.value;
		// we could handle adding the data directly but we want all IO to go through the message_channel
		// (will call our event handler directly tho, no loopback)
		channel(main_channel).send_global("data.add", { [key]: value });
	});
}

function shutdown(){
	channel(main_channel).send_remote(message_type.channel_close, { priority: get_priority() });
}

addEventListener("load", startup);
addEventListener("beforeunload", shutdown);