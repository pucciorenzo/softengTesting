import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

describe("handleDateFilterParams", () => { 
  test('should return an empty object when no date filtering parameters are provided', () => {
    const req = { query: {} };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({});
  });

  test('should throw an error if `date` parameter is provided together with `from` parameter', () => {
    const req = { query: { date: '2023-05-01', from: '2023-04-30' } };
    expect(() => handleDateFilterParams(req)).toThrow('Cannot include date parameter with from or upTo parameters.');
  });

  test('should throw an error if `date` parameter is provided together with `upTo` parameter', () => {
    const req = { query: { date: '2023-05-01', upTo: '2023-05-31' } };
    expect(() => handleDateFilterParams(req)).toThrow('Cannot include date parameter with from or upTo parameters.');
  });

  test('should throw an error if `date` parameter has an invalid format', () => {
    const req = { query: { date: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
  });

  test('should handle `date` parameter correctly', () => {
    const req = { query: { date: '2023-05-01' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({
      date: {
        $gte: new Date('2023-05-01T00:00:00.000Z'),
        $lte: new Date('2023-05-01T23:59:59.999Z')
      }
    });
  });

  test('should handle `from` parameter correctly', () => {
    const req = { query: { from: '2023-04-30' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({ date: { $gte: new Date('2023-04-30T00:00:00.000Z') } });
  });

  test('should handle `upTo` parameter correctly', () => {
    const req = { query: { upTo: '2023-05-31' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({
      date: {
        $lte: new Date('2023-05-31T23:59:59.999Z')
      }
    });
  });

  test('should handle both `from` and `upTo` parameters correctly', () => {
    const req = { query: { from: '2023-04-30', upTo: '2023-05-31' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({
      date: {
        $gte: new Date('2023-04-30T00:00:00.000Z'),
        $lte: new Date('2023-05-31T23:59:59.999Z')
      }
    });
  });
})

describe("verifyAuth", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("handleAmountFilterParams", () => {
  test("should return an empty object when no query parameters are provided", () => {
    const req = { query: {} };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({});
  });

  test("should return the correct filter object when only 'min' is provided", () => {
    const req = { query: { min: "5" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 5 } });
  });

  test("should return the correct filter object when only 'max' is provided", () => {
    const req = { query: { max: "10" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $lte: 10 } });
  });

  test("should return the correct filter object when both 'min' and 'max' are provided", () => {
    const req = { query: { min: "15", max: "25" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 15, $lte: 25 } });
  });

  test("should throw an error when 'min' value is not a number", () => {
    const req = { query: { min: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid min. Expected a numerical value.");
  });

  test("should throw an error when 'max' value is not a number", () => {
    const req = { query: { max: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid max. Expected a numerical value.");
  });

});
  
