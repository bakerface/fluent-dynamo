var dynalite = require('dynalite');
var should = require('should');
var dynamo = require('../lib/dynamo.js');

describe('dynamo.putItem(table)', function() {
  var app;

  beforeEach(function(done) {
    app = dynalite();
    app.listen(4567, done);
  })

  afterEach(function(done) {
    app.close(done);
  })

  it('should reject if table name is invalid length', function(done) {
    dynamo.putItem('no')
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
    dynamo.putItem('Thread')
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
    dynamo.putItem('Thread')
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
    dynamo.putItem('Thread')
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
    dynamo.putItem('Thread')
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

  it('should reject if attribute is null', function(done) {
    dynamo.putItem('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withAttribute()
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The attribute cannot be null',
          name: 'AttributeNullError',
          property: 'attribute'
        });

        done();
      });
  })

  it('should reject if attribute type is invalid', function(done) {
    dynamo.putItem('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withAttribute('ForumName', 'INVALID', 'Amazon')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The specified attribute type is not a valid type',
          name: 'AttributeInvalidTypeError',
          property: 'ForumName'
        });

        done();
      });
  })

  it('should reject if attribute value is undefined', function(done) {
    dynamo.putItem('Thread')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withAttribute('ForumName', 'S')
      .catch(function(reason) {
        should(reason).eql({
          kind: 'error#input-validation',
          message: 'The attribute value must be defined',
          name: 'AttributeValueUndefinedError',
          property: 'ForumName'
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
      .delay(500)
      .then(function() {
        return dynamo.putItem('Thread')
          .withEndpoint('http://localhost:4567')
          .withRegion('us-east-1')
          .withAccessKeyId('access')
          .withSecretAccessKey('secret')
          .withAttribute('ForumName', 'S', 'Amazon')
          .withAttribute('Subject', 'S', 'How do I update multiple items?');
      })
      .then(function(response) {
        should(response).eql({ });
        done();
      });
  })

  it('should handle failed responses', function(done) {
    return dynamo.putItem('Thread')
      .withEndpoint('http://localhost:4567')
      .withRegion('us-east-1')
      .withAccessKeyId('access')
      .withSecretAccessKey('secret')
      .withAttribute('ForumName', 'S', 'Amazon')
      .withAttribute('Subject', 'S', 'How do I update multiple items?')
      .catch(function(reason) {
        should(reason.code).eql('ResourceNotFoundException');
        done();
      });

  })
})
