const Util = require('util');

const Rule = require('./rule');

const DEFAULT_RULES = [{ regexp: '.*' }];

function DDDoS(options) {
  if (typeof options === 'null' || typeof options === 'undefined') {
    options = {};
  }
  this.checkInterval = +options.checkInterval;
  if (isNaN(this.checkInterval) || this.checkInterval <= 0) {
    this.checkInterval = 1000; //NOTE: One second.
  }
  this.paths = new Map();
  this.rules = [];
  (Util.isArray(options.rules) ? options.rules : DEFAULT_RULES).forEach((rule) => {
    if (typeof rule.regexp === 'string') {
      this.rules.push(new Rule(rule));
    } else if (rule.string) {
      this.paths.set(rule.string, new Rule(rule));
    }
  });
  setInterval(this._check.bind(this), this.checkInterval);
}

DDDoS.prototype._check = function() {
  this.paths.forEach((path) => { path.check(); });
  this.rules.forEach((rule) => { rule.check(); });
};

DDDoS.prototype.request = function(ip, path, ddos, next) {
  if (typeof path !== 'string') {
    path = '';
  }
  let rule = this.paths.get(path);
  if (rule) {
    return rule.use(ip, path, ddos, next);
  }
  this.rules.some((rule) => {
    let matches = path.match(rule.regexp);
    if (matches) {
      rule.use(ip, path, ddos, next);
    }
    return matches;
  });
};

DDDoS.prototype.express = function(ipPropertyName, pathPropertyName) {
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
};

module.exports = DDDoS;
