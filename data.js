import { message_channel } from "./message_channel.js";

export const query_params = window.location.search.substring(1).split("&").reduce((previous, current) => {
	const kvp = current.split("=");
	return {...previous, [kvp[0]]: kvp[1]};
}, {});

let data = {};
// get/set whole data object
export const get_data = () => data;
export const set_data = (val) => data = val;
// get/set/change a single property for the data object
export const get_data_property = (prop) => data[prop];
export const change_data_property = (prop, callback) => data[prop] = callback(data[prop]);
export const set_data_property = (prop, val) => data[prop] = val;

// priority of the data, lower is better (start at 1000 to assume others have more recent data)
// used to choose what data on a sync is used (because all windows will send an acknowledgement)
// basically only for the case of getting an acknowledgement from a window that doesn't have up-to-date data themselves
// multiple windows can have the same data priority (because they have the same data)
//
// I'm not sure anymore if this actually does anything meaningful or if (non-data) priority would be enough 🤔
let data_priority = 1000;
export const get_data_priority = () => data_priority;
export const set_data_priority = (val) => data_priority = val;

// priority of the window (for sync requests), lower is better
// the priority level should be unique
let priority = 0;
export const get_priority = () => priority;
export const set_priority = (val) => priority = val;

export const main_channel = "my_message_channel";
// kinda a Singleton channel for every unique name
let channels = {};
export const channel = (channel_name) => {
	if(!channels[channel_name])
		channels[channel_name] = new message_channel(channel_name);
	return channels[channel_name];
};