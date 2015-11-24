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

describe('dynamo.updateItem(table)', function() {
  var aws, dynamo;

  beforeEach(function() {
    aws = { };

    dynamo = fluent(aws)
      .withAccessKeyId('access')
      .withEndpoint('endpoint')
      .withRegion('region')
      .withSecretAccessKey('secret');
  })

  function setExpression() {
    return dynamo.updateItem('Thread')
      .withHashKey('ForumName').asString('Amazon')
      .withRangeKey('Subject').asString('DynamoDB')
      .withSetExpression('LastPostedBy').asString('alice@example.com')
      .withCondition('LastPostedBy').isEqualToString('fred@example.com')
      .withAllNewReturnValues();
  }

  function removeExpression() {
    return dynamo.updateItem('Thread')
      .withHashKey('ForumName').asString('Amazon')
      .withRangeKey('Subject').asString('DynamoDB')
      .withRemoveExpression('Archived')
      .withNoReturnValues();
  }

  function setAndRemoveExpression() {
    return dynamo.updateItem('Thread')
      .withHashKey('ForumName').asString('Amazon')
      .withRangeKey('Subject').asString('DynamoDB')
      .withSetExpression('LastPostedBy').asString('alice@example.com')
      .withRemoveExpression('Archived')
      .withCondition('LastPostedBy').isEqualToString('fred@example.com')
      .withAllNewReturnValues();
  }

  function removeAndSetExpression() {
    return dynamo.updateItem('Thread')
      .withHashKey('ForumName').asString('Amazon')
      .withRangeKey('Subject').asString('DynamoDB')
      .withRemoveExpression('Archived')
      .withSetExpression('LastPostedBy').asString('alice@example.com')
      .withCondition('LastPostedBy').isEqualToString('fred@example.com')
      .withAllNewReturnValues();
  }

  it('should be able to set', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.updateItem = function(options, callback) {
      should(options).eql({
        UpdateExpression: 'set LastPostedBy = :v0',
        ConditionExpression: 'LastPostedBy = :v1',
        ExpressionAttributeValues: {
          ':v0': { S: 'alice@example.com' },
          ':v1': { S: 'fred@example.com' }
        },
        Key: {
          ForumName: { S: 'Amazon' },
          Subject: { S: 'DynamoDB' }
        },
        TableName: 'Thread',
        ReturnValues: 'ALL_NEW'
      });

      done();
    };

    setExpression();
  })

  it('should be able to remove', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.updateItem = function(options, callback) {
      should(options).eql({
        UpdateExpression: 'remove Archived',
        Key: {
          ForumName: { S: 'Amazon' },
          Subject: { S: 'DynamoDB' }
        },
        TableName: 'Thread',
        ReturnValues: 'NONE'
      });

      done();
    };

    removeExpression();
  })

  it('should be able to set and remove', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.updateItem = function(options, callback) {
      should(options).eql({
        UpdateExpression: 'set LastPostedBy = :v0 remove Archived',
        ConditionExpression: 'LastPostedBy = :v1',
        ExpressionAttributeValues: {
          ':v0': { S: 'alice@example.com' },
          ':v1': { S: 'fred@example.com' }
        },
        Key: {
          ForumName: { S: 'Amazon' },
          Subject: { S: 'DynamoDB' }
        },
        TableName: 'Thread',
        ReturnValues: 'ALL_NEW'
      });

      done();
    };

    setAndRemoveExpression();
  })

  it('should be able to remove and set', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.updateItem = function(options, callback) {
      should(options).eql({
        UpdateExpression: 'remove Archived set LastPostedBy = :v0',
        ConditionExpression: 'LastPostedBy = :v1',
        ExpressionAttributeValues: {
          ':v0': { S: 'alice@example.com' },
          ':v1': { S: 'fred@example.com' }
        },
        Key: {
          ForumName: { S: 'Amazon' },
          Subject: { S: 'DynamoDB' }
        },
        TableName: 'Thread',
        ReturnValues: 'ALL_NEW'
      });

      done();
    };

    removeAndSetExpression();
  })

  describe('when the request fails', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.updateItem = function(request, callback) {
        callback('failure');
      };
    })

    it('should throw an error', function(done) {
      setAndRemoveExpression().catch(function(reason) {
        should(reason).eql('failure');
        done();
      });
    })
  })

  describe('when the request succeeds', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.updateItem = function(request, callback) {
        callback(null, {
          Attributes: {
            LastPostedBy: { S: 'alice@example.com' },
            ForumName: { S: 'Amazon' },
            Subject: { S: 'DynamoDB' },
            Views: { N: '5' }
          }
        });
      };
    })

    it('should return the response', function(done) {
      setAndRemoveExpression().then(function(response) {
        should(response).eql({
          LastPostedBy: 'alice@example.com',
          ForumName: 'Amazon',
          Subject: 'DynamoDB',
          Views: 5
        });

        done();
      });
    })
  })

  describe('when there are no attributes', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.updateItem = function(request, callback) {
        callback(null, { });
      };
    })

    it('should return an empty item', function(done) {

      removeExpression().then(function(response) {
        should(response).eql({ });
        done();
      });
    })
  })
})
