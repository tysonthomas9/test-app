'use strict';

var express = require('express');
var router = express.Router();
var Q = require('q');

var options = {
    promiseLib: Q
};

var pgp = require('pg-promise')(options);
const conString = 'postgres://postgres@localhost/testdb1';
var db = pgp(conString);

/* GET top active users listing. */
router.get('/', function(req, res, next) {
    let pageNumber = parseInt(req.query.page);
    let requests = [];

    //execute the query
    db.any('SELECT users.id, users.created_at, users.name, ctab.count FROM users INNER JOIN (SELECT user_id, COUNT(user_id) AS "count" from applications WHERE created_at > (CURRENT_DATE - INTERVAL \'7 day\') GROUP BY user_id) AS ctab ON users.id=ctab.user_id ORDER BY users.id LIMIT 5')
    .then(function (users) {
      users.forEach(function(user) {
        requests.push(db.any('SELECT app.user_id, listings.name from applications AS app INNER JOIN listings ON app.listing_id=listings.id WHERE app.user_id=$1::int AND app.created_at > (CURRENT_DATE - INTERVAL \'7 day\') ORDER BY app.created_at DESC LIMIT 3;', [user.id]));
      });

      Q.all(requests)
      .then(function(listings) {
        listings.forEach(function(listingArray) {
          var newListings = listingArray.map(function (listings) {
            return listings.name;
          });

          users.forEach(function(user) {
            if(user.id === listingArray[0].user_id){
              user.listings = newListings;
            }
          });
        });

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
