'use strict';

var express = require('express');
var router = express.Router();

var pgp = require('pg-promise')({});
const conString = process.env.DB_URL || 'postgres://brvmmhgs6x:puzlacdvls@assignment.codsssqklool.eu-central-1.rds.amazonaws.com:5432/brvmmhgs6x_db';
var db = pgp(conString);

/* GET users listing. */
router.get('/', function(req, res, next) {
    //send error message if its not a number
    if(isNaN(req.query.id)){
      return res.status(400).send({
        message: 'id not a Number'
      });
    }

    let userId = parseInt(req.query.id);

    let user;
    let companies = [];
    let createdListings = [];
    let applications = [];

    //execute the query to fetch the user profile
    db.oneOrNone('SELECT id, name, created_at FROM users WHERE id=$1::int', [userId])
    .then(function (resultUser) {
      //send 'not found' message if user profile not found
      if(!resultUser){
        return res.status(404).send({
          message: 'user not found'
        });
      }

      user = resultUser;

      //execute the query to fetch the companies data
      db.any('SELECT com.id, com.created_at, com.name, teams.contact_user from companies AS com INNER JOIN teams ON com.id=teams.company_id WHERE user_id=$1::int', [userId])
      .then(function (resultCompanies) {
        resultCompanies.forEach(function(row) {
          companies.push({
            id: row.id,
            createdAt: row.created_at,
            name: row.name,
            isContact: row.contact_user
          });
        });
      })
      .then(function() {
        //execute the query to fetch the listings data
        return db.any('SELECT id, created_at, name, description FROM listings WHERE created_by=$1::int', [userId]);
      })
      .then(function (resultListings) {
        resultListings.forEach(function(row) {
          createdListings.push({
            id: row.id,
            createdAt: row.created_at,
            name: row.name,
            description: row.description
          });
        });
      })
      .then(function() {
        //execute the query to fetch the applications data
        return db.any('SELECT app.id, app.created_at, app.cover_letter, list.id AS listings_id, list.name AS listings_name, list.description AS listings_description from applications AS app INNER JOIN listings AS list ON app.listing_id=list.id WHERE user_id=$1::int', [userId]);
      })
      .then(function (resultApplications) {
        resultApplications.forEach(function(row) {
          applications.push({
            id: row.id,
            createdAt: row.created_at,
            listing: {
              id: row.listings_id,
              name: row.listings_name,
              description: row.listings_description
            },
            cover_letter: row.cover_letter
          });
        });
      })
      .then(function () {
        //map the data to spec format
        var resultOutput = {
          id: user.id,
          name: user.name,
          createdAt: user.created_at,
          companies : companies,
          createdListings : createdListings,
          applications: applications
        };

        //send the data to client
        res.json(resultOutput);
      })
      .catch(function (err) {
        //send server error message
        return next({message: err.message});
      });
    })
    .catch(function (err) {
      //send server error message
      return next({message: err.message});
    });
});

module.exports = router;
