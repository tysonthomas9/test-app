'use strict';

var express = require('express');
var router = express.Router();
var Q = require('q');

const options = {
    promiseLib: Q
};

var pgp = require('pg-promise')(options);
const conString = process.env.DB_URL || 'postgres://brvmmhgs6x:puzlacdvls@assignment.codsssqklool.eu-central-1.rds.amazonaws.com:5432/brvmmhgs6x_db';
var db = pgp(conString);

/* GET top active users listing. */
router.get('/', function(req, res, next) {
    //send error message if its not a number
    if(isNaN(req.query.page)){
      return res.status(400).send({
        message: 'page not a Number'
      });
    }

    let pageNumber = parseInt(req.query.page);
    let requests = [];

    //execute the query to fetch the user details and count
    db.any('SELECT users.id, users.created_at, users.name, ctab.count FROM users INNER JOIN (SELECT user_id, COUNT(user_id) AS "count" from applications WHERE created_at > (CURRENT_DATE - INTERVAL \'7 day\') GROUP BY user_id) AS ctab ON users.id=ctab.user_id ORDER BY users.id LIMIT 5')
    .then(function (users) {
      users.forEach(function(user) {
        //execute the query to fetch the user 3 last listings data
        requests.push(db.any('SELECT app.user_id, listings.name from applications AS app INNER JOIN listings ON app.listing_id=listings.id WHERE app.user_id=$1::int AND app.created_at > (CURRENT_DATE - INTERVAL \'7 day\') ORDER BY app.created_at DESC LIMIT 3;', [user.id]));
      });

      //wait for all the query requests to complete
      Q.all(requests)
      .then(function(listings) {

        //iterate over all the reuests
        listings.forEach(function(listingArray) {

          //ceate a new array of listings for this user
          let newListings = listingArray.map(function (listings) {
            return listings.name;
          });

          //iterate over the list of users to find a match
          users.forEach(function(user) {
            if(user.id === listingArray[0].user_id){
              user.listings = newListings;
            }
          });
        });

        //map the output data as the spec document
        let outputUserData = users.map(function (user) {
          return {
            id: user.id,
            createdAt: user.created_at,
            name: user.name,
            count: user.count,
            listings: user.listings
          };
        });

        res.json(outputUserData);
      });
    })
    .catch(function (err) {
      return next({message: err.message});
    });

});

module.exports = router;
