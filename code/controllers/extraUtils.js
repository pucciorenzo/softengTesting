import validator from "validator";


export const createAttribute = (v, t) => { return { value: v, type: t } }

const validationFail = (c) => { return { flag: false, cause: c } }

const validationPass = () => { return { flag: true, cause: 'valid' } }

export const validateAttribute = (attribute) => {
    try {

        const { value, type } = attribute;

        //incomlete/missing attribute
        if (typeof value == "undefined" || value == null) return validationFail("incomplete attribute");

        switch (type) {

            case 'string':
                {
                    //not a string
                    if (typeof value != 'string') return validationFail("not string");

                    //emty string or all whitespace
                    if (value.trim().length == 0) return validationFail("empty string");
                }
                break;

            case 'stringArray':
                {
                    const array = value;

                    //not an array
                    if (!Array.isArray(array)) return validationFail("not array");

                    //no element
                    if (array.length == 0) return validationFail("empty array");

                    //repeating elements or invalid elements//
                    const exists = {};
                    for (const value of array) {

                        //not valid string element
                        let validation = validateAttribute(createAttribute(value, 'string'));
                        if (!validation.flag) return validationFail("at least one: " + validation.cause);

                        //repeating element
                        if (exists[value]) return validationFail("at least one repeating element");
                        exists[value] = true;
                    }
                }
                break;

            case 'emailArray':
                {
                    const array = value;

                    //not an array
                    if (!Array.isArray(array)) return validationFail("not array");

                    //no element
                    if (array.length == 0) return validationFail("empty array");

                    //repeating elements or invalid elements//
                    const exists = {};
                    for (const value of array) {

                        //not valid string element
                        let validation = validateAttribute(createAttribute(value, 'email'));
                        if (!validation.flag) return validationFail("at least one: " + validation.cause);

                        //repeating element
                        if (exists[value]) return validationFail("at least one repeating element");
                        exists[value] = true;
                    }
                }
                break;

            case 'amount':
            case 'number':
            case 'float': {
                //not a number after parsing
                if (isNaN(parseFloat(value))) return validationFail("cannot parse as floating value");
            }
                break;

            case 'email':
                {
                    //incorrect format or invalid characters
                    if (!validator.isEmail(value)) return validationFail("not an email");
                }
                break;

            case 'date':
                {
                    //not YYYY-MM-DD
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(value)) validationFail("invalid date format");
                }
                break;

            default:
                //not known type
                return validationFail("unknown type");
        }

        //all check passed
        return validationPass();

    } catch (error) {
        return validationFail(error.message);
    }

}

export const validateAttributes = (attributes) => {
    try {
        for (const a of attributes) {
            let validation = validateAttribute(a);
            if (!validation.flag) return validation;
        }
        return validationPass();

    } catch (error) {
        console.log(error);
        return { flag: false, cause: error.message };
    }
}


export const resError = (res, code, msg) => res.status(code).json({ error: msg });
export const resData = (res, data) => res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
