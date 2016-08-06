function setProperty(name, options, defOptions, defValue) {
  this[name] = +options[name] || +defOptions[name] || defValue;
  if (isNaN(this[name]) || this[name] < 0) {
    this[name] = defValue;
  }
}

function Rule(options, defOptions) {
  if (typeof options === 'null' || typeof options === 'undefined') {
    options = {};
  }
  if (typeof defOptions === 'null' || typeof defOptions === 'undefined') {
    defOptions = {};
  }
  if (typeof options.string === 'string') {
    this.string = options.string;
  } else if (typeof options.regexp === 'string') {
    this.regexp = new RegExp(options.regexp, options.flags);
  }
  setProperty.call(this, 'weight', options, defOptions, 1);
  setProperty.call(this, 'maxWeight', options, defOptions, 10);
  setProperty.call(this, 'errorCode', options, defOptions, 429); //NOTE: 429 - Too Many Requests.
  setProperty.call(this, 'queueSize', options, defOptions, 0);   //NOTE: No queue.
  if (typeof options.errorData !== 'undefined') {
    this.errorData = options.errorData;
  } else if (typeof defOptions.errorData !== 'undefined') {
    this.errorData = defOptions.errorData;
  } else {
    this.errorData = 'Not so fast!';
  }
  if (typeof defOptions.logFunction === 'function') {
    this.logFunction = defOptions.logFunction;
  }
  this.users = new Map();
}

Rule.prototype.use = function(ip, path, ddos, next) {
  let user = this.users.get(ip);
  if (!user) {
    user = { weight: 0 };
    if (this.queueSize > 0) {
      user.queue = [];
    }
    this.users.set(ip, user);
  }
  user.weight += this.weight;
  if (user.weight > this.maxWeight) {
    if (typeof this.logFunction === 'function') {
      this.logFunction(ip, path, user.weight, this.maxWeight, this.regexp || this.string);
    }
    if (user.queue && user.queue.length < this.queueSize) {
      user.queue.push(next);
    } else if (typeof ddos === 'function') {
      ddos(this.errorCode, this.errorData);
    }
    return;
  }
  if (typeof next === 'function') {
    next();
  }
};

Rule.prototype.check = function() {
  this.users.forEach((user, ip) => {
    user.weight -= this.maxWeight;
    let count = this.maxWeight - user.weight;
    if (user.queue && user.queue.length > 0 && count > 0) {
      let items = user.queue.splice(0, count);
      if (typeof next === 'function') {
        items.forEach((next) => { setImmediate(next); });
      }
      user.weight += count;
    }
    if (user.weight <= 0) {
      this.users.delete(ip);
    }
  });
};

module.exports = Rule;
