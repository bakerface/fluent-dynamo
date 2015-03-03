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

var when = require('when');
var aws = require('aws-sdk');

/**
 * Creates a trampoline function that forwards arguments to this function.
 *
 * @returns {function} The trampoline function.
 *
 */
Function.prototype.curry = function() {
  var fun = this;
  var args = [].slice.call(arguments, 0);

  return function() {
    return fun.apply(this, args.concat([].slice.call(arguments, 0)));
  };
};

/**
 * Creates a new fluent dynamo instance.
 *
 * @param {object} AWS The Amazon SDK (optional).
 * @returns {object} The fluent dynamo instance.
 *
 */
var fluent = module.exports = function(AWS) {
  var options = { };

  AWS = AWS || aws;

  return {
    withAccessKeyId: withAccessKeyId.curry(options),
    withEndpoint: withEndpoint.curry(options),
    withRegion: withRegion.curry(options),
    withSecretAccessKey: withSecretAccessKey.curry(options),
    createTable: createTable.curry(AWS, options),
    putItem: putItem.curry(AWS, options),
    deleteItem: deleteItem.curry(AWS, options)
  };
};

/**
 * Sets the access key id for the connection.
 *
 * @param {object} options The dynamo configuration options.
 * @param {string} value The access key id.
 * @returns {object} The fluent dynamo instance.
 *
 */
function withAccessKeyId(options, value) {
  options.accessKeyId = value;
  return this;
}

/**
 * Sets the endpoint for the connection.
 *
 * @param {object} options The dynamo configuration options.
 * @param {string} value The endpoint.
 * @returns {object} The fluent dynamo instance.
 *
 */
function withEndpoint(options, value) {
  options.endpoint = value;
  return this;
}

/**
 * Sets the region for the connection.
 *
 * @param {object} options The dynamo configuration options.
 * @param {string} value The region.
 * @returns {object} The fluent dynamo instance.
 *
 */
function withRegion(options, value) {
  options.region = value;
  return this;
}

/**
 * Sets the secret access key for the connection.
 *
 * @param {object} options The dynamo configuration options.
 * @param {string} value The secrety access key.
 * @returns {object} The fluent dynamo instance.
 *
 */
function withSecretAccessKey(options, value) {
  options.secretAccessKey = value;
  return this;
}

/**
 * Sends the request to the endpoint.
 *
 * @param {object} AWS The Amazon SDK.
 * @param {object} options The dynamo configuration options.
 * @param {string} method The dynamo method name to invoke.
 * @param {object} request The method request to send.
 * @returns {Promise} A promise for the response.
 *
 */
function send(AWS, options, method, request) {
  return when().then(function() {
    return when.promise(function(resolve, reject) {
      var dynamo = new AWS.DynamoDB(options);

      dynamo[method](request, function(error, response) {
        if (error) reject(error);
        else resolve(response);
      });
    });
  });
}

/**
 * Creates a table in dynamo.
 *
 * @param {object} AWS The Amazon SDK.
 * @param {object} options The dynamo configuration options.
 * @param {string} table The name of the table.
 * @returns {Promise} A promise for the create table response.
 *
 */
function createTable(AWS, options, table) {
  var attributes = [ ];
  var keys = [ ];

  var request = {
    AttributeDefinitions: attributes,
    KeySchema: keys,
    ProvisionedThroughput: { },
    TableName: table
  };

  return {
    __proto__: send(AWS, options, 'createTable', request),
    withHashKey: withHashKey.curry(attributes, keys),
    withRangeKey: withRangeKey.curry(attributes, keys),
    withReadCapacity: withReadCapacity.curry(request),
    withWriteCapacity: withWriteCapacity.curry(request),
    withGlobalSecondaryIndex: withGlobalSecondaryIndex.curry(request),
    withLocalSecondaryIndex: withLocalSecondaryIndex.curry(request)
  };
}

/**
 * Sets the hash key for the table or index.
 *
 * @param {array} attributes The attribute definitions.
 * @param {array} keys The key schema.
 * @param {string} name The name of the hash key.
 * @returns {object} The hash key configuration.
 *
 */
function withHashKey(attributes, keys, name) {
  withKey(keys, 'HASH', name);
  return withAttribute.call(this, attributes, name);
}

/**
 * Sets the range key for the table or index.
 *
 * @param {array} attributes The attribute definitions.
 * @param {array} keys The key schema.
 * @param {string} name The name of the range key.
 * @returns {object} The range key configuration.
 *
 */
function withRangeKey(attributes, keys, name) {
  withKey(keys, 'RANGE', name);
  return withAttribute.call(this, attributes, name);
}

/**
 * Creates a key in the schema.
 *
 * @param {array} keys The key schema.
 * @param {string} type The key type.
 * @param {string} name The name of the key.
 * @returns {object} The key configuration.
 *
 */
function withKey(keys, type, name) {
  keys.push({
    AttributeName: name,
    KeyType: type
  });

  return this;
}

/**
 * Creates an attribute type configuration.
 *
 * @param {object} attribute The attribute definition.
 * @returns {object} The attribute type configuration.
 *
 */
function withType(attribute) {
  function asType(type) {
    attribute.AttributeType = type;
    return this;
  }

  return {
    asType: asType.bind(this),
    asString: asType.bind(this, 'S'),
    asNumber: asType.bind(this, 'N')
  };
}

/**
 * Creates an attribute definition.
 *
 * @param {array} attributes The attribute definitions.
 * @param {string} name The name of the attribute.
 * @returns {object} The attribute type configuration.
 *
 */
function withAttribute(attributes, name) {
  for (var i = 0; i < attributes.length; i++) {
    if (attributes[i].AttributeName == name) {
      return withType.call(this, attributes[i]);
    }
  }

  var attribute = {
    AttributeName: name
  };

  attributes.push(attribute);
  return withType.call(this, attribute);
}

/**
 * Sets the read capacity for the table or index.
 *
 * @param {object} request The create table request.
 * @param {number} units The read capacity units.
 * @returns {Promise} A promise for the create table response.
 *
 */
function withReadCapacity(request, units) {
  request.ProvisionedThroughput.ReadCapacityUnits = units;
  return this;
}

/**
 * Sets the write capacity for the table or index.
 *
 * @param {object} request The create table request.
 * @param {number} units The write capacity units.
 * @returns {Promise} A promise for the create table response.
 *
 */
function withWriteCapacity(request, units) {
  request.ProvisionedThroughput.WriteCapacityUnits = units;
  return this;
}

/**
 * Creates a global secondary index for the table.
 *
 * @param {object} request The create table request.
 * @param {string} name The name of the index.
 * @returns {object} The index configuration.
 *
 */
function withGlobalSecondaryIndex(request, name) {
  var keys = [ ];
  var attributes = request.AttributeDefinitions;

  var index = {
    IndexName: name,
    KeySchema: keys,
    Projection: { },
    ProvisionedThroughput: { }
  };

  request.GlobalSecondaryIndexes = request.GlobalSecondaryIndexes || [ ];
  request.GlobalSecondaryIndexes.push(index);

  return {
    __proto__: withProjection.call(this, index),
    withHashKey: withHashKey.curry(attributes, keys),
    withRangeKey: withRangeKey.curry(attributes, keys),
    withReadCapacity: withReadCapacity.curry(index),
    withWriteCapacity: withWriteCapacity.curry(index)
  };
}

/**
 * Creates a local secondary index for the table.
 *
 * @param {object} request The create table request.
 * @param {string} name The name of the index.
 * @returns {object} The index configuration.
 *
 */
function withLocalSecondaryIndex(request, name) {
  var keys = [ ];
  var attributes = request.AttributeDefinitions;

  var index = {
    IndexName: name,
    KeySchema: keys,
    Projection: { }
  };

  request.LocalSecondaryIndexes = request.LocalSecondaryIndexes || [ ];
  request.LocalSecondaryIndexes.push(index);

  return {
    __proto__: withProjection.call(this, index),
    withHashKey: withHashKey.curry(attributes, keys),
    withRangeKey: withRangeKey.curry(attributes, keys)
  };
}

/**
 * Sets the projection for the index.
 *
 * @param {object} index The index definition.
 * @returns {object} The projection configuration.
 *
 */
function withProjection(index) {
  function project(type) {
    index.Projection.ProjectionType = type;
    return this;
  }

  return {
    withProjection: project.bind(this),
    withAllAttributesProjection: project.bind(this, 'ALL'),
    withKeysOnlyProjection: project.bind(this, 'KEYS_ONLY')
  };
}

/**
 * Creates a new item or replaces an existing item in the table.
 *
 * @param {object} AWS The Amazon SDK.
 * @param {object} options The dynamo configuration options.
 * @param {string} table The name of the table.
 * @returns {Promise} A promise for the put item response.
 *
 */
function putItem(AWS, options, table) {
  var request = {
    Item: { },
    TableName: table
  };

  return {
    __proto__: send(AWS, options, 'putItem', request),
    withAttribute: withAttributeNameAndValue.curry(request.Item),
    withCondition: withCondition.curry(request)
  };
}

/**
 * Creates an item with a value.
 *
 * @param {object} attributes The collection to append to.
 * @param {string} name The name of the attribute.
 * @returns {object} The attribute value configuration.
 *
 */
function withAttributeNameAndValue(attributes, name) {
  function asValue(type, value) {
    var attribute = attributes[name] = { };
    attribute[type] = value;
    return this;
  }

  return {
    asValue: asValue.bind(this),
    asString: asValue.bind(this, 'S'),
    asNumber: asValue.bind(this, 'N')
  };
}

/**
 * Creates a condition on an attribute.
 *
 * @param {object} request The put item request.
 * @param {string} name The name of the attribute.
 * @returns {object} The condition configuration.
 *
 */
function withCondition(request, name) {
  function isOperation(operator, type, value) {
    var key = ':v' + Object.keys(request.ExpressionAttributeValues).length;
    var attribute = request.ExpressionAttributeValues[key] = { };
    attribute[type] = value;

    if (request.ConditionExpression) {
      request.ConditionExpression += ' and ';
    }

    request.ConditionExpression += name + ' ' + operator + ' ' + key;
    return this;
  }

  request.ConditionExpression = request.ConditionExpression || '';
  request.ExpressionAttributeValues = request.ExpressionAttributeValues || { };

  return {
    isOperation: isOperation.bind(this),
    isLessThan: isOperation.bind(this, '<'),
    isLessThanNumber: isOperation.bind(this, '<', 'N'),
    isLessThanOrEqualTo: isOperation.bind(this, '<='),
    isLessThanOrEqualToNumber: isOperation.bind(this, '<=', 'N'),
    isGreaterThan: isOperation.bind(this, '>'),
    isGreaterThanNumber: isOperation.bind(this, '>', 'N'),
    isGreaterThanOrEqualTo: isOperation.bind(this, '>='),
    isGreaterThanOrEqualToNumber: isOperation.bind(this, '>=', 'N'),
    isEqualTo: isOperation.bind(this, '='),
    isEqualToString: isOperation.bind(this, '=', 'S'),
    isEqualToNumber: isOperation.bind(this, '=', 'N'),
    isNotEqualTo: isOperation.bind(this, '<>'),
    isNotEqualToString: isOperation.bind(this, '<>', 'S'),
    isNotEqualToNumber: isOperation.bind(this, '<>', 'N')
  };
}

/**
 * Deletes an item from a table.
 *
 * @param {object} AWS The Amazon SDK.
 * @param {object} options The dynamo configuration options.
 * @param {string} table The name of the table.
 * @returns {Promise} A promise for the delete item response.
 *
 */
function deleteItem(AWS, options, table) {
  var request = {
    Key: { },
    TableName: table
  };

  return {
    __proto__: send(AWS, options, 'deleteItem', request),
    withHashKey: withAttributeNameAndValue.curry(request.Key),
    withRangeKey: withAttributeNameAndValue.curry(request.Key)
  };
}
