// const { default: axios } = import("axios");
// const express = import('express');
// import express from 'express';
// const app = express();
const PgPromise = require("pg-promise");
const express = require('express');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();

const pg = require("pg");
const Pool = pg.Pool;

const API = require('./api');
const axios  = require("axios");

const app = express();

// added cores
// THE CORES ARE ADDED FOR HEROKU AND THEY ARE USED ON ALL MY ROUTES
const cors = require('cors');
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "https://securing-with-jwt.herokuapp.com/");
	res.header(
	  "Access-Control-Allow-Headers",
	  "Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
  });

app.use(cors({
    methods: ['POST','DELETE','UPDATE','PUT','PATCH']
}));
// cores code ends here

//middlewere to make public folder visible
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});

const config = {
	connectionString: process.env.DATABASE_URL || 'postgres://amanda:@262632@localhost:5432/hearts_app',
	// max: 30,
	ssl:{ rejectUnauthorized : false}
 };
 
 const db = pgp(config);


API(app, db);

const PORT = process.env.PORT || 2012;

app.listen(PORT, function () {
	console.log(`App started on port ${PORT}`)
});