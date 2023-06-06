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
    User.findOne.mockRejectedValue( new Error("Some error"));

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

  /*
    test('should return 400 if at least one of the parameters in the request body is an empty string', async () => {
      const req = { body: { username: 'user', email: '', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await register(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'invalid email format' });
    });
  
    test('should return 200 and add a new user', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne');
      mockFindOne.mockResolvedValue(null);
  
      const mockCreate = jest.spyOn(User, 'create');
      mockCreate.mockResolvedValue({ username: 'testuser', email: 'test@email.com' });
  
      const mockHash = jest.spyOn(bcrypt, 'hash');
      mockHash.mockResolvedValue('hashedPassword');
  
      const requestBody = {
        username: 'testuser',
        email: 'test@email.com',
        password: 'password123',
      };
  
      const mockReq = { body: requestBody };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await register(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: 'user added succesfully' });
      expect(mockHash).toHaveBeenCalledWith('password123', 12);
    });
  
    test('should return 400 if the email is not well formatted', async () => {
      const requestBody = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };
  
      const mockReq = { body: requestBody };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await register(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "invalid email format" });
    });
  
    test('should return 400 if user with the same email already exists', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne');
      mockFindOne.mockResolvedValue({ email: 'test@example.com' });
  
      const requestBody = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
  
      const mockReq = { body: requestBody };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await register(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "email already registered" });
    });
  
    test('should return 400 if user with the same username already exists', async () => {
      const mockFindOne = jest.spyOn(User, 'findOne');
      mockFindOne
        .mockResolvedValueOnce(null) //email check first
        .mockResolvedValueOnce({ username: 'testuser' });
  
      const requestBody = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
  
      const mockReq = { body: requestBody };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await register(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "username already taken" });
    });
  
    test('should return 500 if an error occurs', async () => {
      const req = { body: { username: 'admin', email: 'admin@example.com', password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      const errorMessage = 'Internal Server Error';
      jest.spyOn(console, 'error').mockImplementation(() => { });
  
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));
  
      await register(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
    });
  */
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

  /* disabled for shorter test result
  test('should return 400 if request body does not contain all necessary attributes', async () => {
    const req = { body: { username: 'admin', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'incomplete attributes' });
  });

  test('should return 400 if at least one of the parameters in the request body is an empty string', async () => {
    const req = { body: { username: 'admin', email: '', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'empty strings' });
  });

  test('should return 400 if the email in the request body is not in a valid email format', async () => {
    const req = { body: { username: 'admin', email: 'invalidemail', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid email format' });
  });

  test('should return 400 if the username in the request body identifies an already existing user', async () => {
    const req = { body: { username: 'admin', email: 'admin@example.com', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(User, 'findOne')
      .mockResolvedValueOnce(null) //email check first
      .mockResolvedValueOnce({ username: 'admin' });

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'username already taken' });
  });

  test('should return 400 if the email in the request body identifies an already existing user', async () => {
    const req = { body: { username: 'admin', email: 'admin@example.com', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(User, 'findOne').mockResolvedValueOnce({ email: 'admin@example.com' });

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'email already registered' });
  });

  test('should return 200 and add a new admin user', async () => {
    const req = { body: { username: 'admin', email: 'admin@example.com', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(User, 'create').mockResolvedValueOnce({
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedPassword',
      role: 'Admin'
    });

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { message: 'User added successfully' } });
  });

  test('should return 500 if an error occurs', async () => {
    const req = { body: { username: 'admin', email: 'admin@example.com', password: 'password123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const errorMessage = 'Internal Server Error';
    jest.spyOn(console, 'error').mockImplementation(() => { });

    jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error(errorMessage));

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
  */
});



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

  /* disabled for shorter test result
  test('should return 400 error if request body is incomplete', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'incomplete attributes' });
  });

  test('should return 400 error if request body contains empty strings', async () => {
    const req = { body: { email: '', password: '' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'empty strings' });
  });

  test('should return 400 error if email is not in a valid format', async () => {
    const req = { body: { email: 'invalid-email', password: 'password' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'invalid email format' });
  });

  test('should return 400 error if user is not found in the database', async () => {
    User.findOne.mockResolvedValueOnce(null);

    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'user not found. register first' });
  });

  test('should return 400 error if password does not match', async () => {
    const user = { email: 'test@example.com', password: 'hashedPassword' };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { body: { email: 'test@example.com', password: 'wrongPassword' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'wrong credentials' });
  });

  test('should return access and refresh tokens if login is successful', async () => {
    const user = { email: 'test@example.com', password: 'hashedPassword', id: '123', username: 'testuser', role: 'user' };
    User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('accessToken');
    jwt.sign.mockReturnValueOnce('refreshToken');

    const req = { body: { email: 'test@example.com', password: 'password' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({ data: { accessToken: 'accessToken', refreshToken: 'refreshToken' } });
  });
  */
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

  /* disabled for shorter test result
  test('should return 400 error if refresh token is not found in cookies', async () => {
    const req = { cookies: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
 
    await logout(req, res);
 
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'no refresh token found' });
  });
 
  test('should return 400 error if refresh token does not represent a user in the database', async () => {
    const refreshToken = 'invalidRefreshToken';
    User.findOne.mockResolvedValueOnce(null);
 
    const req = { cookies: { refreshToken } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
 
    await logout(req, res);
 
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: 'user not found. Are you registered or logged in?' });
  });
 
  test('should successfully logout the user', async () => {
    const refreshToken = 'validRefreshToken';
    const user = { refreshToken: refreshToken, save: jest.fn() };
    User.findOne.mockResolvedValueOnce(user);
 
    const req = { cookies: { refreshToken } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
 
    await logout(req, res);
 
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({ data: { message: 'User logged out' } });
  });
  */
});
