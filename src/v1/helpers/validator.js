const messagesValidator = require('./validator-messages');
const Validator = require('validatorjs');

function validate(ret, fields, rules) {
    const dataValidate = new Validator(fields, rules, messagesValidator);

    const fails = dataValidate.fails();
    const errors = dataValidate.errors.all();

    if (fails) {
        ret.setError(true);

        for (let field in errors) {
            let messages = errors[field];
            ret.setFieldError(field, true);

            for (let i in messages) {
                let message = messages[i];
                ret.addFieldMessage(field, message);
            }
        }

        ret.setCode(400);
        return false;
    }

    return true;
}

module.exports = validate;
