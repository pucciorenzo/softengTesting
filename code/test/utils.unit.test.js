import jwt from 'jsonwebtoken';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.resetAllMocks();
})


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

  test('should throw an error if `from` parameter has an invalid format', () => {
    const req = { query: { from: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
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

  test('should throw an error if `upTo` parameter has an invalid format', () => {
    const req = { query: { upTo: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
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
  test('authType Simple, should authorize and refresh token', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Simple"
    }
    const mockDecodedRefreshToken = {
      username: "Simple",
      email: "simple@ezwallet.com",
      id: "simple",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "Simple",
      email: "simple@ezwallet.com",
      id: "simple",
      role: "Regular"
    }
    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType Group, should authorize and refresh token since the email is in the group', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType Group, should not authorize since user not in the group', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockDecodedRefreshToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      id: "id6",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      id: "id6",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'user not in group' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });
//redundant
/*
  test('authType Group, should not authorize since refreshToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockDecodedRefreshToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      id: "id6",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType Group, should not authorize since accesssToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockDecodedRefreshToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      id: "id6",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user6",
      email: "user6@ezwallet.com",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });
*/

  test('authType User, should authorize and refresh token', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType User, should not authorize since not the same user', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user2",
      email: "user2@ezwallet.com",
      id: "id2",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user2",
      email: "user2@ezwallet.com",
      id: "id2",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: "cannot access other user's data"}

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

//redundant
/*
  test('authType User, should not authorize since refreshToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType User, should not authorize since accessToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });
*/

  test('authType Admin, should authorize and refresh token', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Admin"
    }
    const mockDecodedRefreshToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockDecodedAccessToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType Admin, should not authorize because not an admin', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Admin"
    }
    const mockDecodedRefreshToken = {
      username: "User1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "User1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'not an admin' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

//redundant
/*
  test('authType Admin, should not authorize since refreshToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Admin"
    }
    const mockDecodedRefreshToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      role: "Admin"
    }
    const mockDecodedAccessToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('authType Admin, should not authorize since accessToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Admin"
    }
    const mockDecodedRefreshToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockDecodedAccessToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      role: "Admin"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });
*/

  test('Should not authorize since invalid tokens', () => {
    const mockReq = {
      cookies: {
        accessToken: " ",
        refreshToken: " "
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Admin"
    }
    const mockDecodedRefreshToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockDecodedAccessToken = {
      username: "Admin",
      email: "admin@ezwallet.com",
      id: "admin",
      role: "Admin"
    }
    const mockResult = { flag: false, cause: 'invalid tokens' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('Should not authorize since refreshToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('Should not authorize since accessToken is missing information', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "User",
      username:"user1"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Token is missing information' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
  });

  test('unknown autherization requested', () => {
    const mockReq = {
      cookies: {
        accessToken: "valid accessToken",
        refreshToken: "valid refreshToken"
      }
    }
    const mockRes = {
      locals: {
        refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
      }
    }
    const mockInfo = {
      authType: "Random"
    }
    const mockDecodedRefreshToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockDecodedAccessToken = {
      username: "user1",
      email: "user1@ezwallet.com",
      id: "id1",
      role: "Regular"
    }
    const mockResult = { flag: false, cause: 'Unknown authorization requested' }

    jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
    jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });

    const result = verifyAuth(mockReq, mockRes, mockInfo);

    expect(result).toEqual(mockResult);
    });

    test('Should authorize, unknown cause', () => {
      const mockReq = {
        cookies: {
          accessToken: "valid accessToken",
          refreshToken: "valid refreshToken"
        }
      }
      const mockRes = {
        locals: {
          refreshedTokenMessage: 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
        }
      }
      const mockInfo = {
        authType: "User",
        username:"user1"
      }
      const mockDecodedRefreshToken = {
        username: "user1",
        email: "user1@ezwallet.com",
        id: "id1",
        role: "Regular"
      }
      const mockDecodedAccessToken = {
        username: "user1",
        email: "user1@ezwallet.com",
        id: "id1",
        role: "Regular"
      }
      const mockResult = { flag: false, cause: 'unknown. Try again' }
  
      jwt.verify.mockReturnValueOnce(mockDecodedRefreshToken);
      jwt.verify.mockReturnValueOnce(mockDecodedAccessToken);
      //jwt.verify.mockImplementationOnce(() => { throw new Error("TokenExpiredError") });
  
      const result = verifyAuth(mockReq, mockRes, mockInfo);
  
      expect(result).toEqual(mockResult);
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

  test("should throw an error when 'min' value is not a number when both 'min' and 'max' are provided", () => {
    const req = { query: { min: "abc", max: "25" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid min. Expected a numerical value.");
  });

  test("should throw an error when 'max' value is not a number when both 'min' and 'max' are provided", () => {
    const req = { query: { min: "15", max: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid max. Expected a numerical value.");
  });

});

