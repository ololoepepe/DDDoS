const {isArray} = require('util');

const Rule = require('./rule');

const DEFAULT_CHECK_INTERVAL = 1000; // One second
const DEFAULT_RULES = [{regexp: '.*'}];

class DDDoS {
  constructor(options = {}) {
    if (options === null) {
      options = {};
    }

    let checkInterval = Number(options.checkInterval);
    if (isNaN(checkInterval) || checkInterval <= 0) {
      checkInterval = DEFAULT_CHECK_INTERVAL;
    }
    this.checkInterval = checkInterval;

    this.paths = new Map();
    this.rules = [];

    const rules = isArray(options.rules) ? options.rules : DEFAULT_RULES;
    rules.forEach(rule => this._addRule(rule, options));

    setInterval(this._check.bind(this), checkInterval);
  }

  request(ip, path, ddos, next) {
    if (typeof path !== 'string') {
      path = '';
    }

    const rule = this.paths.get(path);

    if (rule) {
      rule.use(ip, path, ddos, next);

      return;
    }

    this.rules.some(rule => {
      const matches = path.match(rule.regexp);

      if (matches) {
        rule.use(ip, path, ddos, next);
      }

      return matches;
    });
  }

  express(ipPropertyName, pathPropertyName) {
    if (typeof ipPropertyName !== 'string' || !ipPropertyName) {
      ipPropertyName = 'ip';
    }

    if (typeof pathPropertyName !== 'string' || !pathPropertyName) {
      pathPropertyName = 'path';
    }

    return (req, res, next) => {
      this.request(req[ipPropertyName], req[pathPropertyName], (errorCode, errorData) => {
        res.status(errorCode).send(errorData);
      }, next);
    };
  }

  _addRule(rule, options) {
    if (typeof rule.regexp === 'string') {
      this.rules.push(new Rule(rule, options));
    } else if (typeof rule.string === 'string') {
      this.paths.set(rule.string, new Rule(rule, options));
    }
  }

  _check() {
    this.paths.forEach(path => path.check());
    this.rules.forEach(rule => rule.check());
  }
}

module.exports = DDDoS;
