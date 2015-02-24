var when = require('when');
var validator = require('validator');
var AWS = require('aws-sdk');
var dynamo = module.exports = { };

var REGIONS = [
  'us-east-1',
  'us-west-1', 'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2',
  'ap-northeast-1',
  'sa-east-1'
];

var KEY_TYPES = [ 'S', 'N', 'B' ];

var ATTRIBUTE_TYPES = [
  'B', 'BOOL', 'BS', 'L', 'M', 'N', 'NS', 'NULL', 'S', 'SS'
];

function TableNameInvalidLengthError() {
  this.kind = 'error#input-validation';
  this.property = 'table-name';
  this.name = 'TableNameInvalidLengthError';
  this.message = 'The table name must be between 3 and 255 characters';
}

function EndpointInvalidError() {
  this.kind = 'error#input-validation';
  this.property = 'endpoint';
  this.name = 'EndpointInvalidError';
  this.message = 'The specified endpoint is not a valid URL';
}

function RegionInvalidError() {
  this.kind = 'error#input-validation';
  this.property = 'region';
  this.name = 'RegionInvalidError';
  this.message = 'The specified region is not a valid region';
}

function AccessKeyIdNullError() {
  this.kind = 'error#input-validation';
  this.property = 'access-key-id';
  this.name = 'AccessKeyIdNullError';
  this.message = 'The access key id cannot be null';
}

function SecretAccessKeyNullError() {
  this.kind = 'error#input-validation';
  this.property = 'secret-access-key';
  this.name = 'SecretAccessKeyNullError';
  this.message = 'The secret access key cannot be null';
}

function HashKeyUndefinedError() {
  this.kind = 'error#input-validation';
  this.property = 'hash-key';
  this.name = 'HashKeyUndefinedError';
  this.message = 'A table must have exactly one hash key';
}

function HashKeyNullError() {
  this.kind = 'error#input-validation';
  this.property = 'hash-key';
  this.name = 'HashKeyNullError';
  this.message = 'The hash key cannot be null';
}

function HashKeyInvalidTypeError() {
  this.kind = 'error#input-validation';
  this.property = 'hash-key';
  this.name = 'HashKeyInvalidTypeError';
  this.message = 'The specified hash key type is not a valid type';
}

function MultipleHashKeyError() {
  this.kind = 'error#input-validation';
  this.property = 'hash-key';
  this.name = 'MultipleHashKeyError';
  this.message = 'A table must have exactly one hash key';
}

function RangeKeyNullError() {
  this.kind = 'error#input-validation';
  this.property = 'range-key';
  this.name = 'RangeKeyNullError';
  this.message = 'The range key cannot be null';
}

function RangeKeyInvalidTypeError() {
  this.kind = 'error#input-validation';
  this.property = 'range-key';
  this.name = 'RangeKeyInvalidTypeError';
  this.message = 'The specified range key type is not a valid type';
}

function MultipleRangeKeyError() {
  this.kind = 'error#input-validation';
  this.property = 'range-key';
  this.name = 'MultipleRangeKeyError';
  this.message = 'A table must have no more than one range key';
}

function ReadCapacityUndefinedError() {
  this.kind = 'error#input-validation';
  this.property = 'read-capacity';
  this.name = 'ReadCapacityUndefinedError';
  this.message = 'The provisioned read capacity must be defined';
}

function ReadCapacityInvalidError() {
  this.kind = 'error#input-validation';
  this.property = 'read-capacity';
  this.name = 'ReadCapacityInvalidError';
  this.message = 'The provisioned read capacity must be greater than zero';
}

function WriteCapacityUndefinedError() {
  this.kind = 'error#input-validation';
  this.property = 'write-capacity';
  this.name = 'WriteCapacityUndefinedError';
  this.message = 'The provisioned write capacity must be defined';
}

function WriteCapacityInvalidError() {
  this.kind = 'error#input-validation';
  this.property = 'write-capacity';
  this.name = 'WriteCapacityInvalidError';
  this.message = 'The provisioned write capacity must be greater than zero';
}

function AttributeNullError() {
  this.kind = 'error#input-validation';
  this.property = 'attribute';
  this.name = 'AttributeNullError';
  this.message = 'The attribute cannot be null';
}

function AttributeInvalidTypeError(attribute) {
  this.kind = 'error#input-validation';
  this.property = attribute;
  this.name = 'AttributeInvalidTypeError';
  this.message = 'The specified attribute type is not a valid type';
}

function AttributeValueUndefinedError(attribute) {
  this.kind = 'error#input-validation';
  this.property = attribute;
  this.name = 'AttributeValueUndefinedError';
  this.message = 'The attribute value must be defined';
}

function tableNameIsValidLength(request) {
  if (!validator.isLength(request.TableName, 3, 255)) {
    throw new TableNameInvalidLengthError();
  }
}

function endpointIsValid(options) {
  if (options.endpoint) {
    if (!validator.isURL(options.endpoint)) {
      throw new EndpointInvalidError();
    }
  }
}

function regionIsValid(options) {
  if (!validator.isIn(options.region, REGIONS)) {
    throw new RegionInvalidError();
  }
}

function accessKeyIdIsNotNull(options) {
  if (validator.isNull(options.accessKeyId)) {
    throw new AccessKeyIdNullError();
  }
}

function secretAccessKeyIsNotNull(options) {
  if (validator.isNull(options.secretAccessKey)) {
    throw new SecretAccessKeyNullError();
  }
}

function getKeysByType(request, type) {
  var keys = request.KeySchema.filter(function(key) {
    return key.KeyType == type;
  });

  return keys;
}

function getKeyByType(request, type) {
  return getKeysByType(request, type)[0];
}

function getAttributeByName(request, name) {
  var attributes = request.AttributeDefinitions.filter(function(attr) {
    return attr.AttributeName == name;
  });

  return attributes[0];
}

function hashKeyIsDefinedOnce(request) {
  var count = getKeysByType(request, 'HASH').length;

  if (count == 0) {
    throw new HashKeyUndefinedError();
  }
  else if (count > 1) {
    throw new MultipleHashKeyError();
  }
}

function hashKeyNameIsNotNull(request) {
  var key = getKeyByType(request, 'HASH');

  if (validator.isNull(key.AttributeName)) {
    throw new HashKeyNullError();
  }
}

function hashKeyTypeIsValid(request) {
  var key = getKeyByType(request, 'HASH');
  var attr = getAttributeByName(request, key.AttributeName);

  if (!validator.isIn(attr.AttributeType, KEY_TYPES)) {
    throw new HashKeyInvalidTypeError();
  }
}

function rangeKeyIsDefinedZeroOrOneTimes(request) {
  var count = getKeysByType(request, 'RANGE').length;

  if (count > 1) {
    throw new MultipleRangeKeyError();
  }
  else if (count == 1) {
    return when()
      .then(rangeKeyNameIsNotNull.bind(null, request))
      .then(rangeKeyTypeIsValid.bind(null, request));
  }
}

function rangeKeyNameIsNotNull(request) {
  var key = getKeyByType(request, 'RANGE');

  if (validator.isNull(key.AttributeName)) {
    throw new RangeKeyNullError();
  }
}

function rangeKeyTypeIsValid(request) {
  var key = getKeyByType(request, 'RANGE');
  var attr = getAttributeByName(request, key.AttributeName);

  if (!validator.isIn(attr.AttributeType, KEY_TYPES)) {
    throw new RangeKeyInvalidTypeError();
  }
}

function readCapacityIsValid(request) {
  var capacity = request.ProvisionedThroughput.ReadCapacityUnits;

  if (!validator.isNumeric(capacity)) {
    throw new ReadCapacityUndefinedError();
  }
  else if (capacity < 1) {
    throw new ReadCapacityInvalidError();
  }
}

function writeCapacityIsValid(request) {
  var capacity = request.ProvisionedThroughput.WriteCapacityUnits;

  if (!validator.isNumeric(capacity)) {
    throw new WriteCapacityUndefinedError();
  }
  else if (capacity < 1) {
    throw new WriteCapacityInvalidError();
  }
}

function attributeIsValid(request) {
  for (var key in request.Item) {
    if (validator.isNull(key)) {
      throw new AttributeNullError();
    }

    for (var type in request.Item[key]) {
      if (validator.isNull(request.Item[key][type])) {
        throw new AttributeValueUndefinedError(key);
      }
      else if (!validator.isIn(type, ATTRIBUTE_TYPES)) {
        throw new AttributeInvalidTypeError(key);
      }
    }
  }
}

function withEndpoint(options, endpoint) {
  options.endpoint = endpoint;
  return this;
}

function withRegion(options, region) {
  options.region = region;
  return this;
}

function withAccessKeyId(options, accessKeyId) {
  options.accessKeyId = accessKeyId;
  return this;
}

function withSecretAccessKey(options, secretAccessKey) {
  options.secretAccessKey = secretAccessKey;
  return this;
}

function withHashKey(request, name, type) {
  request.AttributeDefinitions.push({
    AttributeName: name,
    AttributeType: type
  });

  request.KeySchema.push({
    AttributeName: name,
    KeyType: 'HASH'
  });

  return this;
}

function withRangeKey(request, name, type) {
  request.AttributeDefinitions.push({
    AttributeName: name,
    AttributeType: type
  });

  request.KeySchema.push({
    AttributeName: name,
    KeyType: 'RANGE'
  });

  return this;
}

function withReadCapacity(request, capacity) {
  request.ProvisionedThroughput.ReadCapacityUnits = capacity;
  return this;
}

function withWriteCapacity(request, capacity) {
  request.ProvisionedThroughput.WriteCapacityUnits = capacity;
  return this;
}

function withAttribute(request, name, type, value) {
  var attribute = { };
  attribute[type] = value;
  request.Item[name || ""] = attribute;

  return this;
}

function sendRequest(method, options, request) {
  return when.promise(function(fulfill, reject) {
    var database = new AWS.DynamoDB(options);

    database[method](request, function(err, res) {
      if (err) reject(err);
      else fulfill(res);
    });
  });
}

dynamo.createTable = function(name) {
  var options = { };

  var request = {
    AttributeDefinitions: [ ],
    KeySchema: [ ],
    ProvisionedThroughput: { },
    TableName: name
  };

  var p = when()
    .then(tableNameIsValidLength.bind(null, request))
    .then(endpointIsValid.bind(null, options))
    .then(regionIsValid.bind(null, options))
    .then(accessKeyIdIsNotNull.bind(null, options))
    .then(secretAccessKeyIsNotNull.bind(null, options))
    .then(hashKeyIsDefinedOnce.bind(null, request))
    .then(hashKeyNameIsNotNull.bind(null, request))
    .then(hashKeyTypeIsValid.bind(null, request))
    .then(rangeKeyIsDefinedZeroOrOneTimes.bind(null, request))
    .then(readCapacityIsValid.bind(null, request))
    .then(writeCapacityIsValid.bind(null, request))
    .then(sendRequest.bind(null, 'createTable', options, request));

  p.withEndpoint = withEndpoint.bind(p, options);
  p.withRegion = withRegion.bind(p, options);
  p.withAccessKeyId = withAccessKeyId.bind(p, options);
  p.withSecretAccessKey = withSecretAccessKey.bind(p, options);
  p.withHashKey = withHashKey.bind(p, request);
  p.withRangeKey = withRangeKey.bind(p, request);
  p.withReadCapacity = withReadCapacity.bind(p, request);
  p.withWriteCapacity = withWriteCapacity.bind(p, request);

  return p;
};

dynamo.putItem = function(name) {
  var options = { };

  var request = {
    Item: { },
    TableName: name
  };

  var p = when()
    .then(tableNameIsValidLength.bind(null, request))
    .then(endpointIsValid.bind(null, options))
    .then(regionIsValid.bind(null, options))
    .then(accessKeyIdIsNotNull.bind(null, options))
    .then(secretAccessKeyIsNotNull.bind(null, options))
    .then(attributeIsValid.bind(null, request))
    .then(sendRequest.bind(null, 'putItem', options, request));

  p.withEndpoint = withEndpoint.bind(p, options);
  p.withRegion = withRegion.bind(p, options);
  p.withAccessKeyId = withAccessKeyId.bind(p, options);
  p.withSecretAccessKey = withSecretAccessKey.bind(p, options);
  p.withAttribute = withAttribute.bind(p, request);

  return p;
};
