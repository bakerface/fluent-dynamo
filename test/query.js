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

describe('dynamo.query(table)', function() {
  var aws, dynamo;

  beforeEach(function() {
    aws = { };

    dynamo = fluent(aws)
      .withAccessKeyId('access')
      .withEndpoint('endpoint')
      .withRegion('region')
      .withSecretAccessKey('secret');
  })

  function query() {
    return dynamo.query('Thread')
      .withIndex('PostCountIndex')
      .withConsistentRead()
      .withCondition('ForumName').isEqualToString('Amazon')
      .withCondition('Subject').isEqualToString('DynamoDB');
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

    aws.DynamoDB.prototype.query = function(options, callback) {
      should(options).eql({
        ConsistentRead: true,
        IndexName: 'PostCountIndex',
        KeyConditions: {
          ForumName: {
            AttributeValueList: [
              { S: 'Amazon' }
            ],
            ComparisonOperator: 'EQ'
          },
          Subject: {
            AttributeValueList: [
              { S: 'DynamoDB' }
            ],
            ComparisonOperator: 'EQ'
          }
        },
        TableName: 'Thread'
      });

      done();
    };

    query();
  })

  describe('when the request fails', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.query = function(request, callback) {
        callback('failure');
      };
    })

    it('should throw an error', function(done) {
      query().catch(function(reason) {
        should(reason).eql('failure');
        done();
      });
    })
  })

  describe('when the request succeeds', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.query = function(request, callback) {
        callback(null, {
          Items: [
            {
              ForumName: { S: 'Amazon' },
              Subject: { S: 'DynamoDB' },
              PostCount: { N: '100' }
            },
            {
              ForumName: { S: 'Amazon' },
              Subject: { S: 'Elastic Beanstalk' },
              PostCount: { N: '50' }
            }
          ]
        });
      };
    })

    it('should return the response', function(done) {
      query().then(function(response) {
        should(response).eql([
          {
            ForumName: 'Amazon',
            Subject: 'DynamoDB',
            PostCount: 100
          },
          {
            ForumName: 'Amazon',
            Subject: 'Elastic Beanstalk',
            PostCount: 50
          }
        ]);

        done();
      });
    })
  })

  describe('when a partial response is returned', function() {
    beforeEach(function() {
      aws.DynamoDB = function() { };
      aws.DynamoDB.prototype.query = function(request, callback) {
        aws.DynamoDB.prototype.query = function(request, callback) {
          should(request).eql({
            ConsistentRead: true,
            IndexName: 'PostCountIndex',
            ExclusiveStartKey: 'key',
            KeyConditions: {
              ForumName: {
                AttributeValueList: [
                  { S: 'Amazon' }
                ],
                ComparisonOperator: 'EQ'
              },
              Subject: {
                AttributeValueList: [
                  { S: 'DynamoDB' }
                ],
                ComparisonOperator: 'EQ'
              }
            },
            TableName: 'Thread'
          });

          callback(null, {
            Items: [
              {
                ForumName: { S: 'Amazon' },
                Subject: { S: 'Elastic Beanstalk' },
                PostCount: { N: '50' }
              }
            ]
          });
        };

        callback(null, {
          Items: [
            {
              ForumName: { S: 'Amazon' },
              Subject: { S: 'DynamoDB' },
              PostCount: { N: '100' }
            }
          ],
          LastEvaluatedKey: 'key'
        });
      };
    })

    it('should aggregate the results', function(done) {
      query().then(function(response) {
        should(response).eql([
          {
            ForumName: 'Amazon',
            Subject: 'DynamoDB',
            PostCount: 100
          },
          {
            ForumName: 'Amazon',
            Subject: 'Elastic Beanstalk',
            PostCount: 50
          }
        ]);

        done();
      });
    })
  })
})
