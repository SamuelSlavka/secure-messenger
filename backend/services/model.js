const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//defines db schema
const UsersSchema = new Schema({
	name: {
		type: String,
		required: true
	}
});

mongoose.model('users', UsersSchema);