# fluent-dynamo
**A fluent interface for Amazon DynamoDB in Node.js**

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
