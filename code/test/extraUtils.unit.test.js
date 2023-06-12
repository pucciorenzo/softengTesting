
import "jest-extended"
import { createValueTypeObject, validateValueType, validateValueTypes } from '../helpers/extraUtils.js'

import validator from "validator";

//jest.mock('validator');
beforeAll(async () => {

});

afterAll(async () => {

});

//necessary setup to ensure that each test can insert the data it needs
beforeEach(async () => {
    jest.resetAllMocks();
})
afterEach(async () => {

})
describe("createValueTypeObject  ", () => {
    test('should create the object', () => {
        const result = createValueTypeObject()
    });
});

describe("validateValueType ", () => {

    test('should reject string validation for non string type', () => {
        const result = validateValueType({ value: 123, type: 'string' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject non array string array ', () => {
        const result = validateValueType({ value: {}, type: 'stringArray' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject unknown type', () => {
        const result = validateValueType({ value: {}, type: 'random' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should catch error', () => {
        jest.spyOn(validator, 'isEmail').mockImplementationOnce(() => { throw new Error("some error") });
        const result = validateValueType({ value: "email", type: 'email' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject invalid string for amount validation', () => {
        const result = validateValueType({ value: "", type: 'amount' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject invalid string for amount validation', () => {
        const result = validateValueType({ value: "", type: 'amount' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject invalid string for amount validation even if regex passed', () => {
        jest.spyOn(RegExp.prototype, 'test').mockReturnValueOnce(true);
        const result = validateValueType({ value: "a-10.2e10a", type: 'amount' });
       //console.log(result)
        expect(RegExp.prototype.test).toHaveBeenCalledWith("a-10.2e10a");
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should pass float', () => {
        //jest.spyOn(RegExp.prototype, 'test').mockReturnValueOnce(false);
        const result = validateValueType({ value: "-10.2e10", type: 'amount' });
       //console.log(result)
        expect(RegExp.prototype.test).toHaveBeenCalledWith("-10.2e10");
        expect(result).toEqual({ flag: true, cause: expect.any(String) });
    })

    test('should reject non array for email validation', () => {
        const result = validateValueType({ value: "", type: 'emailArray' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

    test('should reject empty array for email validation', () => {
        const result = validateValueType({ value: [], type: 'emailArray' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })

})

describe("validateValueTypes ", () => {
    test('should catch error', () => {
        const result = validateValueTypes({ value: "email", type: 'email' });
       //console.log(result)
        expect(result).toEqual({ flag: false, cause: expect.any(String) });
    })
})