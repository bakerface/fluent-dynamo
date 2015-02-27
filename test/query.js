var dynalite = require('dynalite');
var should = require('should');
var dynamo = require('../lib/dynamo.js');

describe('dynamo.query(table)', function() {
  var app;

  beforeEach(function(done) {
    app = dynalite({
      createTableMs: 0,
      deleteTableMs: 0,
      updateTableMs: 0
    });

    app.listen(4567, done);
  })

  afterEach(function(done) {
    app.close(done);
  })

  it('should reject if table name is invalid length', function(done) {
    dynamo.query('no')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The table name must be between 3 and 255 characters',
          name: 'TableNameInvalidLengthError',
          property: 'table-name'
        });

        done();
      });
  })

  it('should reject if endpoint is invalid', function(done) {
    dynamo.query('Thread')
      .withEndpoint('INVALID')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified endpoint is not a valid URL',
          name: 'EndpointInvalidError',
          property: 'endpoint'
        });

        done();
      });
  })

  it('should reject if region is invalid', function(done) {
    dynamo.query('Thread')
      .withRegion('INVALID')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified region is not a valid region',
          name: 'RegionInvalidError',
          property: 'region'
        });

        done();
      });
  })

  it('should reject if access key id is null', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The access key id cannot be null',
          name: 'AccessKeyIdNullError',
          property: 'access-key-id'
        });

        done();
      });
  })

  it('should reject if secret access key is null', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The secret access key cannot be null',
          name: 'SecretAccessKeyNullError',
          property: 'secret-access-key'
        });

        done();
      });
  })

  it('should reject if comparison name is null', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The comparison cannot be null',
          name: 'ComparisonNullError',
          property: 'comparison'
        });

        done();
      });
  })

  it('should reject if comparison operator is invalid', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison('ForumName', 'INVALID', 'S', 'Amazon')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified comparison operator is not a valid operator',
          name: 'ComparisonInvalidOperatorError',
          property: 'ForumName'
        });

        done();
      });
  })

  it('should reject if comparison type is invalid', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison('ForumName', 'EQ', 'INVALID', 'Amazon')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified comparison type is not a valid type',
          name: 'ComparisonInvalidTypeError',
          property: 'ForumName'
        });

        done();
      });
  })

  it('should reject if comparison value is undefined', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison('ForumName', 'EQ', 'S')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The comparison value must be defined',
          name: 'ComparisonValueUndefinedError',
          property: 'ForumName'
        });

        done();
      });
  })

  it('should reject if limit is invalid', function(done) {
    dynamo.query('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison('ForumName', 'EQ', 'S', 'Amazon')
      .withLimit('INVALID')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified limit is invalid',
          name: 'LimitInvalidError',
          property: 'limit'
        });

        done();
      });
  })

  it('should handle successful responses', function(done) {
    dynamo.createTable('Thread')
      .withEndpoint('http://localhost:4567')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withReadCapacity(1)
      .withWriteCapacity(1)
      .then(function() {
        return dynamo.putItem('Thread')
          .withEndpoint('http://localhost:4567')
          .withRegion('us-east-1')
          .withAccessKeyId('access')
          .withSecretAccessKey('secret')
          .withAttribute('ForumName', 'S', 'Amazon')
          .withAttribute('Subject', 'S', 'How do I update multiple items?');
      })
      .then(function() {
        return dynamo.query('Thread')
          .withEndpoint('http://localhost:4567')
          .withRegion('us-east-1')
          .withAccessKeyId('access')
          .withSecretAccessKey('secret')
          .withComparison('ForumName', 'EQ', 'S', 'Amazon');
      })
      .then(function(response) {
        should(response).eql([
          {
            ForumName: 'Amazon',
            Subject: 'How do I update multiple items?'
          }
        ]);

        done();
      });
  })

  it('should handle failed responses', function(done) {
    return dynamo.query('Thread')
      .withEndpoint('http://localhost:4567')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withComparison('ForumName', 'EQ', 'S', 'Amazon')
      .catch(function(reason) {
        should(reason.code).eql('ResourceNotFoundException');
        done();
      });
  })

  it('should handle paginated responses', function(done) {
    function createSubject(index) {
      return dynamo.putItem('Thread')
        .withEndpoint('http://localhost:4567')
        .withRegion('us-east-1')
        .withAccessKeyId('access')
        .withSecretAccessKey('secret')
        .withAttribute('ForumName', 'S', 'Amazon')
        .withAttribute('Subject', 'S', 'Subject ' + index);
    }

    dynamo.createTable('Thread')
      .withEndpoint('http://localhost:4567')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withReadCapacity(1)
      .withWriteCapacity(1)
      .then(createSubject.bind(null, 0))
      .then(createSubject.bind(null, 1))
      .then(createSubject.bind(null, 2))
      .then(createSubject.bind(null, 3))
      .then(function() {
        return dynamo.query('Thread')
          .withEndpoint('http://localhost:4567')
          .withRegion('us-east-1')
          .withAccessKeyId('access')
          .withSecretAccessKey('secret')
          .withComparison('ForumName', 'EQ', 'S', 'Amazon')
          .withLimit(2);
      })
      .then(function(response) {
        should(response).eql([
          { ForumName: 'Amazon', Subject: 'Subject 0' },
          { ForumName: 'Amazon', Subject: 'Subject 1' },
          { ForumName: 'Amazon', Subject: 'Subject 2' },
          { ForumName: 'Amazon', Subject: 'Subject 3' }
        ]);

        done();
      });
  })
})
