'use strict';

var express = require('express');
var router = express.Router();

var pgp = require('pg-promise')({});
const conString = 'postgres://postgres@localhost/testdb1';
var db = pgp(conString);

/* GET top active users listing. */
router.get('/', function(req, res, next) {
    let pageNumber = parseInt(req.query.page);
    res.json({message: 'done'});
});

module.exports = router;
