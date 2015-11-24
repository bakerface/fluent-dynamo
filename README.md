# fluent-dynamo
**A fluent interface for Amazon DynamoDB in Node.js**

[![npm version](https://badge.fury.io/js/fluent-dynamo.svg)](http://badge.fury.io/js/fluent-dynamo)
[![build status](https://travis-ci.org/bakerface/fluent-dynamo.svg?branch=master)](https://travis-ci.org/bakerface/fluent-dynamo)
[![code climate](https://codeclimate.com/github/bakerface/fluent-dynamo/badges/gpa.svg)](https://codeclimate.com/github/bakerface/fluent-dynamo)
[![test coverage](https://codeclimate.com/github/bakerface/fluent-dynamo/badges/coverage.svg)](https://codeclimate.com/github/bakerface/fluent-dynamo/coverage)
[![github issues](https://img.shields.io/github/issues/bakerface/fluent-dynamo.svg)](https://github.com/bakerface/fluent-dynamo/issues)
[![dependencies](https://david-dm.org/bakerface/fluent-dynamo.svg)](https://david-dm.org/bakerface/fluent-dynamo)
[![dev dependencies](https://david-dm.org/bakerface/fluent-dynamo/dev-status.svg)](https://david-dm.org/bakerface/fluent-dynamo#info=devDependencies)
[![downloads](http://img.shields.io/npm/dm/fluent-dynamo.svg)](https://www.npmjs.com/package/fluent-dynamo)

### dynamo.createTable(table)
Creates a table with the specified configuration (see [CreateTable](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)). Below is an example of creating a table with a global secondary index and a local secondary index.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.createTable('Thread')
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
    .withKeysOnlyProjection()
  .then(function() {
    // the table was created
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### dynamo.putItem(table)
Creates a new item or replaces an existing item in the table (see [PutItem](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)). Below is an example of inserting an item with attribute conditions.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.putItem('Thread')
  .withAttribute('ForumName').asString('Amazon')
  .withAttribute('Subject').asString('DynamoDB')
  .withAttribute('LastPostDateTime').asString('201303190422')
  .withAttribute('PostCount').asNumber(100)
  .withCondition('ForumName').isNotEqualToString('Amazon')
  .withCondition('Subject').isNotEqualToString('DynamoDB');
  .then(function() {
    // the item was inserted into the table
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### dynamo.deleteItem(table)
Deletes an item in the table (see [DeleteItem](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html)). Below is an example of deleting an item with a specific hash key and range key.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.deleteItem('Thread')
  .withHashKey('ForumName').asString('Amazon')
  .withRangeKey('Subject').asString('DynamoDB')
  .then(function() {
    // the item was deleted from the table
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### dynamo.query(table)
Searches for items in the table (see [Query](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)). Below is an example of querying for an item by a specific hash key.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.query('Thread')
  .withConsistentRead()
  .withCondition('ForumName').isEqualToString('Amazon')
  .then(function(items) {
    // the items were found and are in the following format:

    // items = [
    //   {
    //     ForumName: 'Amazon',
    //     Subject: 'DynamoDB',
    //     PostCount: 100
    //   },
    //   {
    //     ForumName: 'Amazon',
    //     Subject: 'Elastic Beanstalk',
    //     PostCount: 50
    //   }
    // ];
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### dynamo.deleteTable(table)
Deletes the table (see [DeleteTable](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteTable.html)). Below is an example of deleting a table by name.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.deleteTable('Thread')
  .then(function() {
    // the table was deleted
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### dynamo.updateItem(table)
Updates and item in a table (see [UpdateItem](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html)). Below is an example of updating an attribute in a table.

``` javascript
var fluent = require('fluent-dynamo');

var dynamo = fluent()
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withRegion('YOUR_REGION')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY');

dynamo.updateItem('Thread')
  .withHashKey('ForumName').asString('Amazon')
  .withRangeKey('Subject').asString('DynamoDB')
  .withSetExpression('LastPostedBy').asString('alice@example.com')
  .withRemoveExpression('Archived')
  .withCondition('LastPostedBy').isEqualToString('fred@example.com')
  .withAllNewReturnValues();
  .then(function() {
    // the "LastPostedBy" attribute is now "alice@example.com"
    // and the "Archived" attribute is removed
  })
  .catch(function(reason) {
    // an error occurred
  });
```
