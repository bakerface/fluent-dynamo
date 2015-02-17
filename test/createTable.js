var dynalite = require('dynalite');
var should = require('should');
var dynamo = require('../lib/dynamo.js');

describe('dynamo.createTable(name)', function() {
  it('should reject if table name is invalid length', function(done) {
    dynamo.createTable('no')
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
    dynamo.createTable('Thread')
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
    dynamo.createTable('Thread')
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
    dynamo.createTable('Thread')
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
    dynamo.createTable('Thread')
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

  it('should reject if hash key is undefined', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'A table must have exactly one hash key',
          name: 'HashKeyUndefinedError',
          property: 'hash-key'
        });

        done();
      });
  })

  it('should reject if hash key is null', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The hash key cannot be null',
          name: 'HashKeyNullError',
          property: 'hash-key'
        });

        done();
      });
  })

  it('should reject if hash key type is invalid', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'INVALID')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified hash key type is not a valid type',
          name: 'HashKeyInvalidTypeError',
          property: 'hash-key'
        });

        done();
      });
  })

  it('should reject if multiple hash keys are defined', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withHashKey('INVALID', 'S')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'A table must have exactly one hash key',
          name: 'MultipleHashKeyError',
          property: 'hash-key'
        });

        done();
      });
  })

  it('should reject if range key is null', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The range key cannot be null',
          name: 'RangeKeyNullError',
          property: 'range-key'
        });

        done();
      });
  })

  it('should reject if range key type is invalid', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'INVALID')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified range key type is not a valid type',
          name: 'RangeKeyInvalidTypeError',
          property: 'range-key'
        });

        done();
      });
  })

  it('should reject if multiple range keys are defined', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withRangeKey('INVALID', 'S')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'A table must have no more than one range key',
          name: 'MultipleRangeKeyError',
          property: 'range-key'
        });

        done();
      });
  })

  it('should reject if read capacity is undefined', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The provisioned read capacity must be defined',
          name: 'ReadCapacityUndefinedError',
          property: 'read-capacity'
        });

        done();
      });
  })

  it('should reject if read capacity is invalid', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withReadCapacity(0)
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The provisioned read capacity must be greater than zero',
          name: 'ReadCapacityInvalidError',
          property: 'read-capacity'
        });

        done();
      });
  })

  it('should reject if write capacity is undefined', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withReadCapacity(1)
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The provisioned write capacity must be defined',
          name: 'WriteCapacityUndefinedError',
          property: 'write-capacity'
        });

        done();
      });
  })

  it('should reject if write capacity is invalid', function(done) {
    dynamo.createTable('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withHashKey('ForumName', 'S')
      .withRangeKey('Subject', 'S')
      .withReadCapacity(1)
      .withWriteCapacity(0)
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The provisioned write capacity must be greater than zero',
          name: 'WriteCapacityInvalidError',
          property: 'write-capacity'
        });

        done();
      });
  })

  it('should handle successful responses', function(done) {
    var app = dynalite();

    app.listen(4567, function(err) {
      if (err) return done(err);

      dynamo.createTable('Thread')
        .withEndpoint('http://localhost:4567')
        .withRegion('us-east-1')
        .withAccessKeyId('access')
        .withSecretAccessKey('secret')
        .withHashKey('ForumName', 'S')
        .withRangeKey('Subject', 'S')
        .withReadCapacity(1)
        .withWriteCapacity(1)
        .then(function(response) {
          should(response.TableDescription.AttributeDefinitions).eql([
            { AttributeName: 'ForumName', AttributeType: 'S' },
            { AttributeName: 'Subject', AttributeType: 'S' }
          ]);

          should(response.TableDescription.TableName).eql('Thread');
          should(response.TableDescription.ItemCount).eql(0);
          should(response.TableDescription.TableSizeBytes).eql(0);
          should(response.TableDescription.TableStatus).eql('CREATING');

          should(response.TableDescription.KeySchema).eql([
            { AttributeName: 'ForumName', KeyType: 'HASH' },
            { AttributeName: 'Subject', KeyType: 'RANGE' }
          ]);

          should(response.TableDescription.ProvisionedThroughput).eql({
            NumberOfDecreasesToday: 0,
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          });

          app.close(done);
        });
    });
  })

  it('should handle failed responses', function(done) {
    var app = dynalite();

    app.listen(4567, function(err) {
      if (err) return done(err);

      dynamo.createTable('Thread')
        .withEndpoint('http://localhost:4567')
        .withRegion('us-east-1')
        .withAccessKeyId('access')
        .withSecretAccessKey('secret')
        .withHashKey('ForumName', 'S')
        .withRangeKey('ForumName', 'S')
        .withReadCapacity(1)
        .withWriteCapacity(1)
        .catch(function(reason) {
          should(reason.code).eql('ValidationException');
          app.close(done);
        });
    });
  })
})
