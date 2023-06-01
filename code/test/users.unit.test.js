import { User } from '../models/User.js';
import { getUsers } from '../controllers/users.js';
import { verifyAuth } from '../controllers/utils.js';

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear()
  //additional `mockClear()` must be placed here
});

describe("getUsers", () => {
  test("should retreive all users", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: [
        { username: "user1", email: "user1@ezwallet.com", role: "Regular" },
        { username: "user2", email: "user2@ezwallet.com", role: "Regular" },
        { username: "user3", email: "user3@ezwallet.com", role: "Regular" },
        { username: "user4", email: "user4@ezwallet.com", role: "Regular" },
        { username: "user5", email: "user5@ezwallet.com", role: "Regular" },
      ]
    }
    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    User.find.mockResolvedValue([
      { _id: "id1", username: "user1", email: "user1@ezwallet.com", password: "hashedPassword1", role: "Regular" },
      { _id: "id2", username: "user2", email: "user2@ezwallet.com", password: "hashedPassword2", role: "Regular" },
      { _id: "id3", username: "user3", email: "user3@ezwallet.com", password: "hashedPassword3", role: "Regular" },
      { _id: "id4", username: "user4", email: "user4@ezwallet.com", password: "hashedPassword4", role: "Regular" },
      { _id: "id5", username: "user5", email: "user5@ezwallet.com", password: "hashedPassword5", role: "Regular" },
    ])

    await getUsers(mockReq, mockRes);

    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(User.find).toHaveBeenCalledWith({});

    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  })

})

describe("getUser", () => { })

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })