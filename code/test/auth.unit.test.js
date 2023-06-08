import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { register, registerAdmin, login, logout } from '../controllers/auth.js';
import bcrypt from 'bcryptjs';

jest.mock("bcryptjs");
jest.mock('../models/User.js');
jest.mock("jsonwebtoken");

beforeEach(() => {
  jest.resetAllMocks();
})
afterEach(() => {
  jest.resetAllMocks();
})


describe("register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register user', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "user1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockHashedPassword = "hashedPassword1"
    const mockUserToSave = {
      username: mockReq.body.username,
      email: mockReq.body.email,
      password: mockHashedPassword,
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: {
        message: "User added successfully"
      }
    }

    //mock implementations
    User.findOne.mockResolvedValueOnce(false);
    User.findOne.mockResolvedValueOnce(false);
    bcrypt.hash.mockResolvedValueOnce(mockHashedPassword);
    User.create.mockResolvedValueOnce(true);

    //call 
    await register(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockReq.body.password, 12);
    expect(User.create).toHaveBeenCalledWith(mockUserToSave);
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the username in the request body identifies an already existing user', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "user1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(false);
    User.findOne.mockResolvedValueOnce(true);

    //call 
    await register(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the email in the request body identifies an already existing user', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "user1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(true);

    //call 
    await register(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the email in the request body is not in a valid email format', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "user@ezwallet",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })


  test('should return a 400 error if at least one of the parameters in the request body is an empty string', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the request body does not contain all the necessary attributes', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await register(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 500 error if error is occurs', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "user1",
        email: "user1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 500;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockRejectedValue(new Error("Some error"));

    //call 
    await register(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

});


describe("registerAdmin", () => {

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should register admin', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "admin1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockHashedPassword = "hashedPassword1"
    const mockUserToSave = {
      username: mockReq.body.username,
      email: mockReq.body.email,
      password: mockHashedPassword,
      role: "Admin"
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: {
        message: "Admin added successfully"
      }
    }

    //mock implementations
    User.findOne.mockResolvedValueOnce(false);
    User.findOne.mockResolvedValueOnce(false);
    bcrypt.hash.mockResolvedValueOnce(mockHashedPassword);
    User.create.mockResolvedValueOnce(true);

    //call 
    await registerAdmin(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockReq.body.password, 12);
    expect(User.create).toHaveBeenCalledWith(mockUserToSave);
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the username in the request body identifies an already existing user', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "admin1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(false);
    User.findOne.mockResolvedValueOnce(true);

    //call 
    await registerAdmin(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.body.username });
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the email in the request body identifies an already existing user', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "admin1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(true);

    //call 
    await registerAdmin(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })



  test('should return a 400 error if the email in the request body is not in a valid email format', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "admin.@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await registerAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if at least one of the parameters in the request body is an empty string', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await registerAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 400 error if the request body does not contain all the necessary attributes', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    await registerAdmin(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test('should return a 500 error if error occurs', async () => {

    //mock variables
    const mockReq = {
      body: {
        username: "admin1",
        email: "admin1@ezwallet.com",
        password: "password1",
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 500;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockRejectedValue(new Error("Some error"));

    //call 
    await registerAdmin(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

})




describe('login', () => {

  test('should log in successfully', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.com",
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockHashedPassword = "hashedPassword1";
    const mockAccessToken = "access token";
    const mockRefreshToken = "refresh token";
    const mockSavedUser = {
      username: mockReq.body.username,
      email: mockReq.body.email,
      password: mockHashedPassword,
      role: "Admin",
      refreshToken: null,
      save: jest.fn()
    }
    const processEnvACCESS_KEY = "EZWALLET";
    const mockResStatus = 200;
    const mockResJson = {
      data: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      }
    }

    //mock implementations
    User.findOne.mockResolvedValueOnce(mockSavedUser);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce(mockAccessToken);
    jwt.sign.mockReturnValueOnce(mockRefreshToken);
    mockSavedUser.save.mockResolvedValueOnce(true);

    //call 
    await login(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.body.password, mockHashedPassword);
    expect(jwt.sign).toHaveBeenCalledWith({
      email: mockSavedUser.email,
      id: mockSavedUser.id,
      username: mockSavedUser.username,
      role: mockSavedUser.role
    }, processEnvACCESS_KEY, { expiresIn: '1h' });
    expect(jwt.sign).toHaveBeenCalledWith({
      email: mockSavedUser.email,
      id: mockSavedUser.id,
      username: mockSavedUser.username,
      role: mockSavedUser.role
    }, processEnvACCESS_KEY, { expiresIn: '7d' });
    expect(mockSavedUser.save).toHaveBeenCalledWith();
    expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", mockAccessToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 60 * 60 * 1000, sameSite: "none", secure: true })
    expect(mockRes.cookie).toHaveBeenCalledWith("refreshToken", mockRefreshToken, { httpOnly: true, domain: "localhost", path: "/api", maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "none", secure: true })

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 500 error if any error thrown', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.com",
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockHashedPassword = "hashedPassword1";
    const mockAccessToken = "access token";
    const mockRefreshToken = "refresh token";
    const mockSavedUser = {
      username: mockReq.body.username,
      email: mockReq.body.email,
      password: mockHashedPassword,
      role: "Admin",
      refreshToken: null,
      save: jest.fn()
    }
    const processEnvACCESS_KEY = "EZWALLET";
    const mockResStatus = 500;
    const mockResJson = { error: expect.any(String) }

    //mock implementations
    User.findOne.mockResolvedValueOnce(mockSavedUser);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce(mockAccessToken);
    jwt.sign.mockReturnValueOnce(mockRefreshToken);
    mockSavedUser.save.mockRejectedValueOnce(new Error("something went wrong"));

    //call 
    await login(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.body.password, mockHashedPassword);
    expect(jwt.sign).toHaveBeenCalledWith({
      email: mockSavedUser.email,
      id: mockSavedUser.id,
      username: mockSavedUser.username,
      role: mockSavedUser.role
    }, processEnvACCESS_KEY, { expiresIn: '1h' });
    expect(jwt.sign).toHaveBeenCalledWith({
      email: mockSavedUser.email,
      id: mockSavedUser.id,
      username: mockSavedUser.username,
      role: mockSavedUser.role
    }, processEnvACCESS_KEY, { expiresIn: '7d' });
    expect(mockSavedUser.save).toHaveBeenCalledWith();

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 400 error if the supplied password does not match with the one in the database  ', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.com",
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockHashedPassword = "hashedPassword1";
    const mockSavedUser = {
      username: mockReq.body.username,
      email: mockReq.body.email,
      password: mockHashedPassword,
      role: "Admin",
      refreshToken: null,
      save: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    //mock implementations
    User.findOne.mockResolvedValueOnce(mockSavedUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    //call 
    await login(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockReq.body.password, mockHashedPassword);

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 400 error if the email in the request body does not identify a user in the database  ', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.com",
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    //mock implementations
    User.findOne.mockResolvedValueOnce(null);

    //call 
    await login(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ email: mockReq.body.email });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 400 error if the email in the request body is not in a valid email format  ', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.coms",
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    //call 
    await login(mockReq, mockRes);

    //test
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 400 error if at least one of the parameters in the request body is an empty string  ', async () => {

    //mock variables
    const mockReq = {
      body: {
        email: "user1@ezwallet.coms",
        password: "",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    //call 
    await login(mockReq, mockRes);

    //test
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return a 400 error if the request body does not contain all the necessary attributes  ', async () => {

    //mock variables
    const mockReq = {
      body: {
        password: "password1",
      },
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) }

    //call 
    await login(mockReq, mockRes);

    //test
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });


});


describe('logout', () => {

  beforeEach(() => {
    // Reset the mocked functions and values before each test
    jest.clearAllMocks();
  });

  test('should log out successfully', async () => {

    //mock variables
    const mockAccessToken = "access token";
    const mockRefreshToken = "refresh token";
    const mockReq = {
      cookies: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      },
      body: {

      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockLoggedInUser = {
      username: "user1",
      email: "user1@ezwallet.com",
      password: "hashedPassword1",
      role: "Regular",
      refreshToken: mockRefreshToken,
      save: jest.fn()
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: {
        message: "User logged out"
      }
    }
    //mock implementations
    User.findOne.mockResolvedValueOnce(mockLoggedInUser);
    mockLoggedInUser.save.mockResolvedValueOnce(true);

    //call 
    await logout(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockRefreshToken });
    expect(mockLoggedInUser.save).toHaveBeenCalledWith();
    expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
    expect(mockRes.cookie).toHaveBeenCalledWith("refreshToken", "", { httpOnly: true, path: '/api', maxAge: 0, sameSite: 'none', secure: true })
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test('should return 500 error if error is thrown', async () => {

    //mock variables
    const mockAccessToken = "access token";
    const mockRefreshToken = "refresh token";
    const mockReq = {
      cookies: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      },
      body: {

      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockLoggedInUser = {
      username: "user1",
      email: "user1@ezwallet.com",
      password: "hashedPassword1",
      role: "Regular",
      refreshToken: mockRefreshToken,
      save: jest.fn()
    }
    const mockResStatus = 500;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(mockLoggedInUser);
    mockLoggedInUser.save.mockRejectedValue(new Error("save error"));

    //call 
    await logout(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockRefreshToken });
    expect(mockLoggedInUser.save).toHaveBeenCalledWith();

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test("should return a 400 error if the refresh token in the request's cookies does not represent a user in the database ", async () => {

    //mock variables
    const mockAccessToken = "access token";
    const mockRefreshToken = "refresh token";
    const mockReq = {
      cookies: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      },
      body: {

      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //mock implementations
    User.findOne.mockResolvedValueOnce(null);

    //call 
    await logout(mockReq, mockRes);

    //test
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockRefreshToken });

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });

  test("should return a 400 error if the request does not have a refresh token in the cookies  ", async () => {

    //mock variables
    const mockAccessToken = "access token";
    const mockRefreshToken = "";
    const mockReq = {
      cookies: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      },
      body: {

      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      },
      cookie: jest.fn()
    }
    const mockResStatus = 400;
    const mockResJson = { error: expect.any(String) };

    //call 
    await logout(mockReq, mockRes);

    //test
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  });


});
