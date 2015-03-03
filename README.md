# fluent-dynamo
**A fluent interface for Amazon DynamoDB in Node.js**

### dynamo.createTable(name)
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
