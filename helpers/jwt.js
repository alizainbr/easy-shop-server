const expressJwt = require('express-jwt');

const authJwt = () => {

	const secret = process.env.SECRET;

	const apiUrl = process.env.API_URL;

	return expressJwt({
		
		secret,
		algorithms:['HS256'],
		//to validate admin
		isRevoked:isRevoked

	}).unless({

		path:[
		{url:/\/public\/uploads(.*)/,methods:['GET','OPTIONS']},
		{url:/\/api\/v1\/products(.*)/,methods:['GET','OPTIONS']},
		{url:/\/api\/v1\/categories(.*)/,methods:['GET','OPTIONS']},
		`${apiUrl}/users/login`,
		`${apiUrl}/users/register`
		]

	});

};

const isRevoked = (req,payload,done) => {

	if(!payload.isAdmin){

		done(null,true);

	};

	done();

};

module.exports = authJwt;