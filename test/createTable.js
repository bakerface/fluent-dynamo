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

describe('dynamo.createTable(table)', function() {
  var aws, dynamo;

  beforeEach(function() {
    aws = { };

    dynamo = fluent(aws)
      .withAccessKeyId('access')
      .withEndpoint('endpoint')
      .withRegion('region')
      .withSecretAccessKey('secret');
  })

  function createTable() {
    return dynamo.createTable('Thread')
      .withHashKey('ForumName').asString()
      .withRangeKey('Subject').asString()
      .withReadCapacity(5)
      .withWriteCapacity(5)
      .withGlobalSecondaryIndex('PostCountIndex')
        .withHashKey('ForumName').asString()
        .withRangeKey('PostCount').asNumber()
        .withReadCapacity(1)
        .withWriteCapacity(1)
        .withAllAttributesProjection()
      .withLocalSecondaryIndex('LastPostIndex')
        .withHashKey('ForumName').asString()
        .withRangeKey('LastPostDateTime').asString()
        .withKeysOnlyProjection();
  }

  it('should create the table', function(done) {
    aws.DynamoDB = function(options) {
      should(options).eql({
        accessKeyId: 'access',
        endpoint: 'endpoint',
        region: 'region',
        secretAccessKey: 'secret'
      });
    };

    aws.DynamoDB.prototype.createTable = function(options, callback) {
      should(options).eql({
        AttributeDefinitions: [
          { AttributeName: 'ForumName', AttributeType: 'S' },
          { AttributeName: 'Subject', AttributeType: 'S' },
          { AttributeName: 'PostCount', AttributeType: 'N' },
          { AttributeName: 'LastPostDateTime', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'PostCountIndex',
            KeySchema: [
              { AttributeName: 'ForumName', KeyType: 'HASH' },
              { AttributeName: 'PostCount', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            }
          }
        ],
        KeySchema: [
          { AttributeName: 'ForumName', KeyType: 'HASH' },
          { AttributeName: 'Subject', KeyType: 'RANGE' }
        ],
        LocalSecondaryIndexes: [
          {
            IndexName: 'LastPostIndex',
            KeySchema: [
              { AttributeName: 'ForumName', KeyType: 'HASH' },
              { AttributeName: 'LastPostDateTime', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'KEYS_ONLY' }
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        },
        TableName: 'Thread'
      });

      done();
    };

    createTable();
  })

  describe('when the request fails', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.createTable = function(request, callback) {
        callback('failure');
      };
    })

    it('should throw an error', function(done) {
      createTable().catch(function(reason) {
        should(reason).eql('failure');
        done();
      });
    })
  })

  describe('when the request succeeds', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.createTable = function(request, callback) {
        callback(null, 'success');
      };
    })

    it('should return the response', function(done) {
      createTable().then(function(response) {
        should(response).eql('success');
        done();
      });
    })
  })
})
