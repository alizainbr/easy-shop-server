const express = require('express');
const app = express();

require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const api = process.env.API_URL;
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');

app.use(cors());
app.options('*',cors());

//routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');

//middlewares
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));

app.use(`${api}/products`,productRoutes);
app.use(`${api}/categories`,categoryRoutes);
app.use(`${api}/users`,userRoutes); 
app.use(`${api}/orders`,orderRoutes);

const mongoUri = process.env.CONNECTION_STRING;

mongoose.connect(mongoUri,{

	useNewUrlParser:true,
	useUnifiedTopology:true,
	dbName:'Eshop'

});

mongoose.connection.on('connected',() => {

	console.log('connected');

});

mongoose.connection.on('error',(err) => {

	console.log(err.message);

});

//For development 
/*app.listen(3000,() => {

	console.log('okay!');

});*/

//For production

var server = app.listen(process.env.PORT || 3000, function(){

	var port = server.address().PORT;

	console.log('Running on' + server);

});
