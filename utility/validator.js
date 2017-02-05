var validators = {
    required: function(key) {
        return !!this[key];
    },
    max: function(key, size) {
        return this[key] && (this[key].length <= size);
    },
    min: function(key, size) {
        return this[key] && (this[key].length >= size);
    },
    confirmed: function(key, key_confirmation) {
        return this[key] && (this[key] === this[key_confirmation]);
    },
    email: function(key) {
        return this[key] && /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(this[key]);
    },
    numeric: function(key) {
        return this[key] && /^[0-9]*$/.test(this[key]);
    },
    alpha: function(key) {
        return this[key] && /^[a-zA-Z]*$/.test(this[key]);
    },
    alpha_num: function(key) {
        return this[key] && /^[a-zA-Z0-9]*$/.test(this[key]);
    }
};
/**
 * 依据规则验证数据
 * @param rules 规则
 * @param data 被验证的对象
 * @param callback 回调
 */

exports.validator = function(rules, data, callback) {
    for (var key in rules) {
        var i = 0,
            rule = rules[key],
            len = rule.length;
        while (i < len) {
            var rule_split = rule[i].split(':');
            var fun = rule_split[0];
            var args = rule_split.slice(1);
            args.unshift(key);
            if (!validators[fun].apply(data, args)) {
                return callback(new Error('input wrong on: ' + key));
            }
            ++i;
        }
    }
    return callback(null);
};
