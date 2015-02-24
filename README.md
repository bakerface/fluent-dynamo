# fluent-dynamo
**A fluent interface for Amazon DynamoDB in Node.js**

### [createTable](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)

``` javascript
var dynamo = require('fluent-dynamo');

dynamo.createTable('Thread')
  .withRegion('us-east-1')
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY')
  .withHashKey('ForumName', 'S')
  .withRangeKey('Subject', 'S')
  .withAttribute('LastPostDateTime', 'S')
  .withLocalSecondaryIndex('LastPostIndex')
    .withHashKey('ForumName')
    .withRangeKey('LastPostDateTime')
    .withKeysOnlyProjection()
  .withReadCapacity(5)
  .withWriteCapacity(5)
  .then(function() {
    // the table was created
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### [putItem](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

``` javascript
var dynamo = require('fluent-dynamo');

dynamo.putItem('Thread')
  .withRegion('us-east-1')
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY')
  .withAttribute('ForumName', 'S', 'Amazon')
  .withAttribute('Subject', 'S', 'How do I update multiple items?')
  .then(function() {
    // the item was inserted into the database
  })
  .catch(function(reason) {
    // an error occurred
  });
```

### [query](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)

``` javascript
var dynamo = require('fluent-dynamo');

dynamo.query('Thread')
  .withRegion('us-east-1')
  .withAccessKeyId('YOUR_ACCESS_KEY_ID')
  .withSecretAccessKey('YOUR_SECRET_ACCESS_KEY')
  .withComparison('ForumName', 'EQ', 'S', 'Amazon')
  .withLimit(10)
  .then(function(items) {
    // the array of items
    // pagination is handled for you
  })
  .catch(function(reason) {
    // an error occurred
  });
```
