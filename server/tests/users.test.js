'use strict';

var should = require('should');
var request = require('supertest');

describe('Routes Test', function() {
  var url = 'http://localhost:3000';

  describe('Users', function() {

    it('should return a user with profile details', function(done) {
      var userId = 1;

      request(url)
    	.get('/users?id=' + userId)
      .expect(200)
    	.end(function(err, res) {
        if (err) {
          throw err;
        }

        //check the user profile data
        (res.body.id).should.equal(userId);
        (res.body.name).should.equal('Mark');
        (res.body.createdAt).should.not.equal(null);
        (res.body).should.have.property('companies');
        (res.body).should.have.property('createdListings');
        (res.body).should.have.property('applications');

        done();
      });
    });

    it('should not return a user with profile details', function(done) {
      var userId = 10;

      request(url)
      .get('/users?id=' + userId)
      .expect(404)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        //check the user not found message
        (res.body).should.not.have.property('id');
        (res.body.message).should.equal('user not found');

        done();
      });
    });

    it('should return error message for string id', function(done) {
      var userId = 'abd';

      request(url)
      .get('/users?id=' + userId)
      .expect(400)
      .end(function(err, res) {
        if (err) {
          throw err;
        }

        //check the id not a number message
        (res.body.message).should.equal('id not a Number');

        done();
      });
    });
  });
});
