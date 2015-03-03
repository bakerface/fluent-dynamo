/**
 * Copyright (c) 2015 Christopher M. Baker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

var fluent = require('..');
var should = require('should');

describe('dynamo.deleteItem(table)', function() {
  var aws, dynamo;

  beforeEach(function() {
    aws = { };

    dynamo = fluent(aws)
      .withAccessKeyId('access')
      .withEndpoint('endpoint')
      .withRegion('region')
      .withSecretAccessKey('secret');
  })

  function deleteItem() {
    return dynamo.deleteItem('Thread')
      .withHashKey('ForumName').asString('Amazon')
      .withRangeKey('Subject').asString('DynamoDB');
  }

  it('should delete the item', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.deleteItem = function(options, callback) {
      should(options).eql({
        Key: {
          ForumName: { S: 'Amazon' },
          Subject: { S: 'DynamoDB' },
        },
        TableName: 'Thread'
      });

      done();
    };

    deleteItem();
  })

  describe('when the request fails', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.deleteItem = function(request, callback) {
        callback('failure');
      };
    })

    it('should throw an error', function(done) {
      deleteItem().catch(function(reason) {
        should(reason).eql('failure');
        done();
      });
    })
  })

  describe('when the request succeeds', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.deleteItem = function(request, callback) {
        callback(null, 'success');
      };
    })

    it('should return the response', function(done) {
      deleteItem().then(function(response) {
        should(response).eql('success');
        done();
      });
    })
  })
})
