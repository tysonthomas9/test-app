'use strict';

var should = require('should');
var request = require('supertest');

describe('Routes Test', function() {
  var url = 'http://localhost:3000';

  describe('Top Active Users', function() {

    it('should return the top active user with profile details', function(done) {
      var page = 1;

      request(url)
    	.get('/topActiveUsers?page=' + page)
      .expect(200)
    	.end(function(err, res) {
        if (err) {
          throw err;
        }

        //check the user profile data for top active users
        (res.body).should.be.an.Array();
        (res.body).should.not.be.an.empty();
        (res.body[0].id).should.not.equal(null);
        (res.body[0].name).should.not.equal(null);
        (res.body[0].createdAt).should.not.equal(null);
        (res.body[0].listings).should.not.be.an.empty();

        done();
      });
    });

    it('should return error message for string page', function(done) {
      var page = 'abd';

      request(url)
      .get('/topActiveUsers?page=' + page)
      .expect(400)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        //check the error message when page input is not a number
        (res.body.message).should.equal('page not a Number');

        done();
      });
    });
  });
});
