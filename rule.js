const HTTP_TOO_MANY_REQUESTS = 429;

const DEFAULT_WEIGHT = 1;
const DEFAULT_MAX_WEIGHT = 10;
const DEFAULT_ERROR_CODE = HTTP_TOO_MANY_REQUESTS;
const DEFAULT_QUEUE_SIZE = 0; // No queue.
const DEFAULT_ERROR_DATA = 'Not so fast!';

class Rule {
  static get DEFAULT_WEIGHT() {
    return DEFAULT_WEIGHT;
  }

  static get DEFAULT_MAX_WEIGHT() {
    return DEFAULT_MAX_WEIGHT;
  }

  static get DEFAULT_ERROR_CODE() {
    return DEFAULT_ERROR_CODE;
  }

  static get DEFAULT_QUEUE_SIZE() {
    return DEFAULT_QUEUE_SIZE;
  }

  static get DEFAULT_ERROR_DATA() {
    return DEFAULT_ERROR_DATA;
  }

  constructor(rule = {}, options = {}) {
    if (rule === null) {
      rule = {};
    }

    if (options === null) {
      options = {};
    }

    const {string, regexp} = rule;

    this.string = string;
    this.regexp = regexp;
    this.weight = _getNumber('weight', rule, options, DEFAULT_WEIGHT);
    this.maxWeight = _getNumber('maxWeight', rule, options, DEFAULT_MAX_WEIGHT);
    this.errorCode = _getNumber('errorCode', rule, options, DEFAULT_ERROR_CODE);
    this.queueSize = _getNumber('queueSize', rule, options, DEFAULT_QUEUE_SIZE);
    this.errorData = _getNonUndefined('errorData', rule, options, DEFAULT_ERROR_DATA);
    this.logFunction = _getFunction('logFunction', rule, options);

    this.users = new Map();
  }

  use(ip, path, ddos, next) {
    let user = this.users.get(ip);

    if (user) {
      user.weight += this.weight;
    } else {
      user = {
        weight: this.weight,
        queue: []
      };

      this.users.set(ip, user);
    }

    if (user.weight <= this.maxWeight) {
      if (typeof next === 'function') {
        next();
      }

      return;
    }

    if (typeof this.logFunction === 'function') {
      this.logFunction(ip, path, user.weight, this.maxWeight, this.regexp || this.string);
    }

    if (user.queue.length < this.queueSize) {
      user.queue.push(next);
    } else if (typeof ddos === 'function') {
      ddos(this.errorCode, this.errorData);
    }
  }

  check() {
    this.users.forEach((user, ip) => {
      user.weight -= this.maxWeight;

      const count = this.maxWeight - user.weight;

      if ((count > 0) && (user.queue.length > 0)) {
        user.queue
          .splice(0, count)
          .filter(next => typeof next === 'function')
          .forEach(next => setImmediate(next));

        user.weight += count;
      }

      if (user.weight <= 0) {
        this.users.delete(ip);
      }
    });
  }
}

function _getNumber(name, rule, options, defValue) {
  const value = Number(rule[name]) || Number(options[name]);

  if (isNaN(value) || (value < 0)) {
    return defValue;
  }

  return value;
}

function _getNonUndefined(name, rule, options, defValue) {
  let value = rule[name];

  if (value !== undefined) {
    return value;
  }

  value = options[name];

  if (value !== undefined) {
    return value;
  }

  return defValue;
}

function _getFunction(name, rule, options, defValue) {
  let value = rule[name];

  if (typeof value === 'function') {
    return value;
  }

  value = options[name];

  if (typeof value === 'function') {
    return value;
  }

  return defValue;
}

module.exports = Rule;
