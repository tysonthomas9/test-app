var express = require('express');
var router = express.Router();

var pgp = require('pg-promise')({});
const conString = 'postgres://postgres@localhost/testdb1'
var db = pgp(conString);

/* GET users listing. */
router.get('/', function(req, res, next) {
    var userId = parseInt(req.query.id);

    //execute the query
    db.any('SELECT app.id, app.created_at, app.cover_letter, list.id AS listings_id, list.name AS listings_name, list.description AS listings_description from applications AS app INNER JOIN listings AS list ON app.listing_id=list.id WHERE user_id=$1::int', [userId])
    .then(function (result) {
      var applications = [];

      result.forEach(function(row) {
        applications.push({
          id: row.id,
          createdAt: row.created_at,
          listing: {
            id: row.listings_id,
            name: row.listings_name,
            description: row.listings_description
          },
          cover_letter: row.cover_letter
        })
      });

      res.json(applications);
    })
    .catch(function (err) {
      return next({message: err.message});
    });
});

module.exports = router;
