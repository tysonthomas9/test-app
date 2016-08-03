var express = require('express');
var router = express.Router();

var pg = require('pg');
const conString = 'postgres://postgres@localhost/testdb1'

/* GET users listing. */
router.get('/', function(req, res, next) {
  pg.connect(conString, function (err, client, done) {
    if (err) throw err;

    //execute the query
    client.query('SELECT app.id, app.created_at, app.cover_letter, list.id AS listings_id, list.name AS listings_name, list.description AS listings_description from applications AS app INNER JOIN listings AS list ON app.listing_id=list.id WHERE user_id=$1::int', [req.query.id], function (err, result) {
      if (err) throw err;

      var applications = [];
      result.rows.forEach(function(row) {
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

      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
    });
  });
});

module.exports = router;
