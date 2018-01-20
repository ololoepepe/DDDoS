const assert = require('assert');

const Rule = require('../rule');

describe('Rule', () => {
  describe('constructor', () => {
    const PARAMS = {
      weight: Rule.DEFAULT_WEIGHT + 1,
      maxWeight: Rule.DEFAULT_MAX_WEIGHT + 100,
      errorCode: Rule.DEFAULT_ERROR_CODE + 1,
      queueSize: Rule.DEFAULT_QUEUE_SIZE + 10,
      errorData: {custom: 'error data'},
      logFunction: () => {}
    };

    it('should create a Rule instance with default parameters', () => {
      const rule = new Rule();

      assert.strictEqual(rule.string, undefined);
      assert.strictEqual(rule.regexp, undefined);
      assert.strictEqual(rule.weight, Rule.DEFAULT_WEIGHT);
      assert.strictEqual(rule.maxWeight, Rule.DEFAULT_MAX_WEIGHT);
      assert.strictEqual(rule.errorCode, Rule.DEFAULT_ERROR_CODE);
      assert.strictEqual(rule.queueSize, Rule.DEFAULT_QUEUE_SIZE);
      assert.strictEqual(rule.errorData, Rule.DEFAULT_ERROR_DATA);
      assert.strictEqual(rule.logFunction, undefined);
    });

    it('should create a Rule instance with parameters specified (string)', () => {
      const STRING = '/custom/path';

      const rule = new Rule({
        ...PARAMS,
        string: STRING
      });

      assert.strictEqual(rule.string, STRING);
      assert.strictEqual(rule.regexp, undefined);
      assert.strictEqual(rule.weight, PARAMS.weight);
      assert.strictEqual(rule.maxWeight, PARAMS.maxWeight);
      assert.strictEqual(rule.errorCode, PARAMS.errorCode);
      assert.strictEqual(rule.queueSize, PARAMS.queueSize);
      assert.strictEqual(rule.errorData, PARAMS.errorData);
      assert.strictEqual(rule.logFunction, PARAMS.logFunction);
    });

    it('should create a Rule instance with parameters specified (regexp)', () => {
      const REGEXP = '^/.+$';

      const rule = new Rule({
        ...PARAMS,
        regexp: REGEXP
      });

      assert.strictEqual(rule.string, undefined);
      assert.strictEqual(rule.regexp, REGEXP);
      assert.strictEqual(rule.weight, PARAMS.weight);
      assert.strictEqual(rule.maxWeight, PARAMS.maxWeight);
      assert.strictEqual(rule.errorCode, PARAMS.errorCode);
      assert.strictEqual(rule.queueSize, PARAMS.queueSize);
      assert.strictEqual(rule.errorData, PARAMS.errorData);
      assert.strictEqual(rule.logFunction, PARAMS.logFunction);
    });

    it('should create a Rule instance with default parameters specified (string)', () => {
      const STRING = '/custom/path';

      const rule = new Rule({string: STRING}, PARAMS);

      assert.strictEqual(rule.string, STRING);
      assert.strictEqual(rule.regexp, undefined);
      assert.strictEqual(rule.weight, PARAMS.weight);
      assert.strictEqual(rule.maxWeight, PARAMS.maxWeight);
      assert.strictEqual(rule.errorCode, PARAMS.errorCode);
      assert.strictEqual(rule.queueSize, PARAMS.queueSize);
      assert.strictEqual(rule.errorData, PARAMS.errorData);
      assert.strictEqual(rule.logFunction, PARAMS.logFunction);
    });

    it('should create a Rule instance with default parameters specified (regexp)', () => {
      const REGEXP = '^/.+$';

      const rule = new Rule({regexp: REGEXP}, PARAMS);

      assert.strictEqual(rule.string, undefined);
      assert.strictEqual(rule.regexp, REGEXP);
      assert.strictEqual(rule.weight, PARAMS.weight);
      assert.strictEqual(rule.maxWeight, PARAMS.maxWeight);
      assert.strictEqual(rule.errorCode, PARAMS.errorCode);
      assert.strictEqual(rule.queueSize, PARAMS.queueSize);
      assert.strictEqual(rule.errorData, PARAMS.errorData);
      assert.strictEqual(rule.logFunction, PARAMS.logFunction);
    });
  });
});
