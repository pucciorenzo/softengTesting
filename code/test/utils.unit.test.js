import jwt from 'jsonwebtoken';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.resetAllMocks();
})

const mockValidToken = "valid token";
const mockInvalidToken = "invalid token";

const mockValidDecodedUserToken = {
  username: "user0",
  email: "user0@ezwallet.com",
  id: "id",
  role: "Regular"
}
const mockValidDecodedAdminToken = {
  username: "admin0",
  email: "admin0@ezwallet.com",
  id: "id",
  role: "Admin"
}
const mockDecodedMissingInfoToken = {
  username: "user0",
  email: "",
  id: "id",
  role: "Regular"
}

const mockTokenExpiredError = new Error("Verify failed"); mockTokenExpiredError.name = "TokenExpiredError";



describe("U4.1 handleDateFilterParams", () => {
  test('U4.1.1 should return an empty object when no date filtering parameters are provided', () => {
    const req = { query: {} };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({});
  });

  test('U4.1.2 should throw an error if date parameter is provided together with from parameter', () => {
    const req = { query: { date: '2023-05-01', from: '2023-04-30' } };
    expect(() => handleDateFilterParams(req)).toThrow('Cannot include date parameter with from or upTo parameters.');
  });

  test('U4.1.3 should throw an error if date parameter is provided together with upTo parameter', () => {
    const req = { query: { date: '2023-05-01', upTo: '2023-05-31' } };
    expect(() => handleDateFilterParams(req)).toThrow('Cannot include date parameter with from or upTo parameters.');
  });

  test('U4.1.4 should throw an error if date parameter has an invalid format', () => {
    const req = { query: { date: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
  });

  test('U4.1.5 should handle date parameter correctly', () => {
    const req = { query: { date: '2023-05-01' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({
      date: {
        $gte: new Date('2023-05-01T00:00:00.000Z'),
        $lte: new Date('2023-05-01T23:59:59.999Z')
      }
    });
  });

  test('U4.1.6 should handle from parameter correctly', () => {
    const req = { query: { from: '2023-04-30' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({ date: { $gte: new Date('2023-04-30T00:00:00.000Z') } });
  });

  test('U4.1.7 should throw an error if from parameter has an invalid format', () => {
    const req = { query: { from: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
  });

  test('U4.1.8 should handle upTo parameter correctly', () => {
    const req = { query: { upTo: '2023-05-31' } };
    const result = handleDateFilterParams(req);
    expect(result).toEqual({
      date: {
        $lte: new Date('2023-05-31T23:59:59.999Z')
      }
    });
  });

  test('U4.1.9 should throw an error if upTo parameter has an invalid format', () => {
    const req = { query: { upTo: '2023/05/01' } };
    expect(() => handleDateFilterParams(req)).toThrow('Invalid date format. YYYY-MM-DD format expected.');
  });

  test('U4.1.10 should handle both from and upTo parameters correctly', () => {
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


describe("U4.2 verifyAuth", () => {

  test('U4.2.1 authType Simple, should authorize without refresh token', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    expect(mockRes.locals.refreshedTokenMessage).toEqual(null)
    expect(result).toEqual(mockResult);
  });

  test('U4.2.2 authType Simple, should authorize and refresh token', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))
    expect(result).toEqual(mockResult);
  });

  test('U4.2.3 authType User, should authorize and refresh token (username match)', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      },
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "User",
      username: "user0"
    }

    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))
    expect(result).toEqual(mockResult);
  });

  test('U4.2.4 authType User, should not authorize (username mismatch)', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      },
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "User",
      username: "user10"
    }
    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.5 authType Group, should authorize and refresh token (user in group email)', () => {
    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        "user0@ezwallet.com",
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockResult = { flag: true, cause: 'Authorized' }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))
    expect(result).toEqual(mockResult);
  });

  test('U4.2.6 authType Group, should not authorize since user not in the group', () => {
    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Group",
      emails: [
        //"user0@ezwallet.com",
        "user1@ezwallet.com",
        "user2@ezwallet.com",
        "user3@ezwallet.com",
        "user4@ezwallet.com",
        "user5@ezwallet.com",
      ]
    }
    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))
    expect(result).toEqual(mockResult);

  });

  test('U4.2.7 authType Admin, should authorize and refresh token (user role is admin)', () => {
    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Admin",
      //  emails: [
      //    "user0@ezwallet.com",
      //    "user1@ezwallet.com",
      //    "user2@ezwallet.com",
      //    "user3@ezwallet.com",
      //    "user4@ezwallet.com",
      //    "user5@ezwallet.com",
      //  ]
    }
    const mockResult = { flag: true, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedAdminToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedAdminToken);
    jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedAdminToken, "EZWALLET", { expiresIn: '1h' })
    expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))
    expect(result).toEqual(mockResult);
  });

  test('U4.2.8 authType Admin, should not authorize(user role is not admin)', () => {
    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Admin",
      //  emails: [
      //    "user0@ezwallet.com",
      //    "user1@ezwallet.com",
      //    "user2@ezwallet.com",
      //    "user3@ezwallet.com",
      //    "user4@ezwallet.com",
      //    "user5@ezwallet.com",
      //  ]
    }
    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });
    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedAdminToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.9 authType unknown, should not authorize', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Random"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.10 authType Simple, should not authorize if error occurs when refreshing', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.11 should not authorize if mismatched tokens', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedAdminToken);
    //jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.12 should not authorize if access token with missing information', () => {

    const mockReq = {
      cookies: {
        accessToken: mockInvalidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    //jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockInvalidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });


  test('U4.2.13 should not authorize if access token verify fails', () => {

    const mockReq = {
      cookies: {
        accessToken: mockInvalidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    expect(jwt.verify).toHaveBeenCalledWith(mockInvalidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.14 should not authorize if refresh token with missing information', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockValidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET");
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });


  test('U4.2.15 should not authorize if refresh token verify fails', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockInvalidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    //jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    //jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw new Error("some different error") });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockInvalidToken, "EZWALLET");
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });

  test('U4.2.16 should not authorize if refresh token expired', () => {

    const mockReq = {
      cookies: {
        accessToken: mockValidToken,
        refreshToken: mockInvalidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    //jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    //jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    expect(jwt.verify).toHaveBeenCalledWith(mockInvalidToken, "EZWALLET");
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });


  test('U4.2.17 should not authorize if missing/empty token', () => {

    const mockReq = {
      cookies: {
        refreshToken: mockInvalidToken
      }
    }
    const mockRes = {
      cookie: jest.fn(),
      locals: {
        refreshedTokenMessage: null
      }
    }
    const mockInfo = {
      authType: "Simple"
    }

    const mockResult = { flag: false, cause: expect.any(String) }

    //jwt.verify.mockReturnValueOnce(mockDecodedMissingInfoToken);
    //jwt.verify.mockReturnValueOnce(mockValidDecodedUserToken);
    //jwt.verify.mockImplementationOnce(() => { throw mockTokenExpiredError });
    //jwt.sign.mockReturnValueOnce(mockValidToken);

    const result = verifyAuth(mockReq, mockRes, mockInfo);
    //console.log(JSON.stringify({ result, mockRes }, null, 2));

    //expect(jwt.verify).toHaveBeenCalledWith(mockInvalidToken, "EZWALLET");
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: true });
    //expect(jwt.verify).toHaveBeenCalledWith(mockValidToken, "EZWALLET", { ignoreExpiration: false });

    //expect(jwt.sign).toHaveBeenCalledWith(mockValidDecodedUserToken, "EZWALLET", { expiresIn: '1h' })
    //expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', mockValidToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });
    //expect(mockRes.locals.refreshedTokenMessage).toEqual(expect.any(String))

    expect(result).toEqual(mockResult);
  });


});



describe("U4.3 handleAmountFilterParams", () => {
  test("U4.3.1 should return an empty object when no query parameters are provided", () => {
    const req = { query: {} };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({});
  });

  test("U4.3.2 should return the correct filter object when only min parameter is provided", () => {
    const req = { query: { min: "5" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 5 } });
  });

  test("U4.3.3 should return the correct filter object when only max parameter is provided", () => {
    const req = { query: { max: "10" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $lte: 10 } });
  });

  test("U4.3.4 should return the correct filter object when both min and max parameters are provided", () => {
    const req = { query: { min: "15", max: "25" } };
    const result = handleAmountFilterParams(req);
    expect(result).toEqual({ amount: { $gte: 15, $lte: 25 } });
  });

  test("U4.3.5 should throw an error when min value is not a number", () => {
    const req = { query: { min: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid min. Expected a numerical value.");
  });

  test("U4.3.6 should throw an error when max value is not a number", () => {
    const req = { query: { max: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid max. Expected a numerical value.");
  });

  test("U4.3.7 should throw an error when min value is not a number when both min and max parameters are provided", () => {
    const req = { query: { min: "abc", max: "25" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid min. Expected a numerical value.");
  });

  test("U4.3.8 should throw an error when max value is not a number when both min and max parameter are provided", () => {
    const req = { query: { min: "15", max: "abc" } };
    expect(() => {
      handleAmountFilterParams(req);
    }).toThrow("Invalid max. Expected a numerical value.");
  });

});

