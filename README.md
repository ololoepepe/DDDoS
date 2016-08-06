# Configurable Denial-Of-Service prevention library

The extra D means it is better than the ddos package.

## Example

```
/* With Express*/

let expresss = require('express');
let DDDoS = require('dddos');

let app = express();

app.use(new DDDoS({
  /*Configuration options*/
}).express('ip', 'path')); //Default values for the IP and path property names, may be omitted.

/* Without Express*/

let ddos = new DDDoS({
  rules: [{
    string: '/index.html',
    maxWeight: 20
  }]
});

setInterval(() => {
  ddos.request('127.0.0.1', '/index.html', (errorCode, errorData) => {
    console.log(`Oops, DDoS! [${errorCode}] ${errorData}`);
  }, () => {
    console.log('The request has passed.');
  });
}, 100); //Emulate a request every 100 ms.
```

## Configuration

### errorData

Data to be passes to the client on DDoS detection. Default: "Not so fast!".

### errorCode

HTTP error code to be set on DDoS detection. Default: 429 (Too Many Requests).

### weight

Default request weight. 1 by default.

### maxWeight

Default maximum allowed weight per IP. 10 by default.

### checkInterval

Interval (in milliseconds) to check connections and decrement weights. Default: 1000 (1 second).

### rules

List of rules to apply to each request. Example:

```
  rules: [
    { /*Allow 4 requests accessing the application API per checkInterval*/
      regexp: "^/api.*",
      flags: "i",
      maxWeight: 4,
      queueSize: 4 /*If request limit is exceeded, new requests are added to the queue*/
    },
    { /*Only allow 1 search request per check interval.*/
      string: "/action/search",
      maxWeight: 1
    },
    { /*Allow up to 16 other requests per check interval.*/
      regexp: ".*",
      maxWeight: 16
    }
]
```

### logFunction

A function used for logging detected DDoS. The following arguments are passes to the function:

* ```IP``` — user's IP address
* ```path``` — request path
* ```user.weight``` — current weight
* ```rule.maxWeight``` — maximum allowed weight
* ```rule.regexp || rule.string``` — rule pattern

## How this module works

Every request is checked against a chain of rules. Rules with a `string` path pattern are checked first. They are added to a map for the sake of performance. Then the request is checked against every `regexp`-based rules.

If request `path` matches the rule's pattern, that rule is applied. Other rules are not checked.

When using with Express, user IP is retrieved from the `req.ip` property by default. You have to handle proxies (`X-Forwarded-For` header and such) yourself, for exmaple, by installing a middlewares before the `dddos` module.

A weight is assigned to each user. Every time a new request is made, the weight is increased. If the weight becomes larger than `maxWeight`, the `errorData` is returned to the user along with the `errorCode`.

Requests which did not match any rule or have passed the test are forwarded to the next middleware/router.

Every `checkInterval` milliseconds all users are checked. The weights are decremented by the `maxWegight`. If user's weight becomes less than or equal to 0, that user is deleted from the map.

## Example situation

Say `weight` is 1, `maxWeight` is 10 and `checkInterval` is 1000.

A user makes 35 requests in one second. First 10 request pass the module, the other 25 do not. The weight is 35 for now. Then the user stops sending requests.

After 1 second passes by, the weight is decremented by 10 and becomes 25. The user attempts to make one more request, which does not pass. The weight becomes 26.

Two sceonds later (after two checks) the weight is decreased twice and becomes 6. The user attempts to make a request, which now successfully passes the check. The weight becomes 7.
