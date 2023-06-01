import { Group, User } from '../models/User.js';
import { createGroup, getGroup, getGroups, getUser, getUsers } from '../controllers/users.js';
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
  verifyAuth.mockClear();

  User.find.mockClear();
  User.findOne.mockClear();

  Group.find.mockClear();
  Group.findOne.mockClear();

  Group.prototype.save.mockClear();
});

describe("getUsers", () => {

  test("should retreive all users", async () => {

    //mock variables
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

    //mock implementations
    verifyAuth.mockReturnValue({ flag: true, cause: "authorized" });
    User.find.mockResolvedValue([
      { _id: "id1", username: "user1", email: "user1@ezwallet.com", password: "hashedPassword1", role: "Regular" },
      { _id: "id2", username: "user2", email: "user2@ezwallet.com", password: "hashedPassword2", role: "Regular" },
      { _id: "id3", username: "user3", email: "user3@ezwallet.com", password: "hashedPassword3", role: "Regular" },
      { _id: "id4", username: "user4", email: "user4@ezwallet.com", password: "hashedPassword4", role: "Regular" },
      { _id: "id5", username: "user5", email: "user5@ezwallet.com", password: "hashedPassword5", role: "Regular" },
    ])

    //call function
    await getUsers(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(User.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

})

describe("getUser", () => {

  test("should retreive user (user auth)", async () => {

    //mock variables
    const mockUser = { _id: "id1", username: "user1", email: "user1@ezwallet.com", role: "Regular" };
    const mockReq = {
      params: {
        username: mockUser.username
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResData = { username: mockUser.username, email: mockUser.email, role: mockUser.role };
    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    verifyAuth.mockReturnValueOnce({ flag: false, cause: "unauthorized" });
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    User.findOne.mockResolvedValue(mockUser);

    //call function
    await getUser(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "User", username: mockReq.params.username });
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(User.findOne).toHaveBeenCalledWith({ username: mockReq.params.username });
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

})

describe("createGroup", () => {

  test("should create the group", async () => {

    //mock variables
    const mockName = "group1";
    const mockMemberEmails = [
      "user1@ezwallet.com",
      "user2@ezwallet.com",
      "user3@ezwallet.com",
      "user4@ezwallet.com",
      "user5@ezwallet.com",
      "user6@ezwallet.com",
    ]
    const mockRefreshToken = "refresh token";
    const mockReq = {
      body: {
        name: mockName,
        memberEmails: mockMemberEmails
      },
      cookies: {
        refreshToken: mockRefreshToken
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockSavedGroup = {
      _id: "id1",
      name: mockName,
      members: [
        { email: "user1@ezwallet.com", user: "id1" },
        { email: "user4@ezwallet.com", user: "id4" },
      ]
    }
    const mockResData = {
      group: {
        name: mockName,
        members: [
          { email: "user1@ezwallet.com" },
          { email: "user4@ezwallet.com" },
        ]
      },
      alreadyInGroup: [
        { email: "user2@ezwallet.com" },
        { email: "user5@ezwallet.com" },
      ],
      membersNotFound: [
        { email: "user3@ezwallet.com" },
        { email: "user6@ezwallet.com" },
      ]
    }
    const mockUsers = [
      { _id: "id1", username: "user1", email: "user1@ezwallet.com", password: "hashedPassword1", role: "Regular" },
      { _id: "id2", username: "user2", email: "user2@ezwallet.com", password: "hashedPassword2", role: "Regular" },
      { _id: "id4", username: "user4", email: "user4@ezwallet.com", password: "hashedPassword4", role: "Regular" },
      { _id: "id5", username: "user5", email: "user5@ezwallet.com", password: "hashedPassword5", role: "Regular" },
    ]
    const mockExistingUser = mockUsers[0];
    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    Group.findOne.mockResolvedValueOnce(false); //group with name does not exist
    User.findOne.mockResolvedValueOnce(mockUsers[0]);   //user exists
    Group.findOne.mockResolvedValueOnce(false);             //user not group member
    User.findOne.mockResolvedValueOnce(mockUsers[1]);   //user exists
    Group.findOne.mockResolvedValueOnce(true);              //user a group member
    User.findOne.mockResolvedValueOnce(false);          //user does not exist
    User.findOne.mockResolvedValueOnce(mockUsers[2]);   //user exists
    Group.findOne.mockResolvedValueOnce(false);             //user not group member
    User.findOne.mockResolvedValueOnce(mockUsers[3]);   //user exists
    Group.findOne.mockResolvedValueOnce(true);              //user a group member
    User.findOne.mockResolvedValueOnce(false);          //user does not exist
    User.findOne.mockResolvedValueOnce(mockExistingUser); //get calling user
    Group.prototype.save.mockResolvedValueOnce(mockSavedGroup); //save group

    //call function
    await createGroup(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Simple" });
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockName });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[0] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[0] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[1] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[1] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[2] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[3] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[3] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[4] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[4] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[5] });
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
    expect(Group.prototype.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

})

describe("getGroups", () => {

  test("should retreive all groups", async () => {

    //mock variables
    const mockGroups = [
      { _id: "id1", name: "group1", members: [{ _id: "id1", email: "user1@ezwallet.com", user: "user_id1" }, { _id: "id2", email: "user2@ezwallet.com", user: "user_id2" }] },
      { _id: "id2", name: "group2", members: [{ _id: "id3", email: "user3@ezwallet.com", user: "user_id3" }, { _id: "id4", email: "user4@ezwallet.com", user: "user_id4" }] },
      { _id: "id4", name: "group3", members: [{ _id: "id5", email: "user5@ezwallet.com", user: "user_id5" }, { _id: "id5", email: "user6@ezwallet.com", user: "user_id5" }] },
    ]
    const mockReq = {
      params: {
      },
      body: {
      },
      cookies: {
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResData = [
      { name: "group1", members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }] },
      { name: "group2", members: [{ email: "user3@ezwallet.com" }, { email: "user4@ezwallet.com" }] },
      { name: "group3", members: [{ email: "user5@ezwallet.com" }, { email: "user6@ezwallet.com" }] },
    ]

    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    Group.find.mockResolvedValue(mockGroups);

    //call function
    await getGroups(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(Group.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  })

});

describe("getGroup", () => {
  test("should retreive the group", async () => {

    //mock variables
    const mockName = "group1"
    const mockGroup = {
      _id: "id1", name: "group1", members: [{ _id: "id1", email: "user1@ezwallet.com", user: "user_id1" }, { _id: "id2", email: "user2@ezwallet.com", user: "user_id2" }]
    }
    const mockMemberEmails = [
      "user1@ezwallet.com",
      "user2@ezwallet.com",
    ]

    const mockReq = {
      params: {
        name: mockName
      },
      body: {
      },
      cookies: {
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResData = {
      group: { name: "group1", members: [{ email: "user1@ezwallet.com" }, { email: "user2@ezwallet.com" }] }
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    Group.findOne.mockResolvedValue(mockGroup);
    verifyAuth.mockReturnValueOnce({ flag: false, cause: "not admin" });
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });

    //call function
    await getGroup(mockReq, mockRes);

    //tests
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockName });
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: mockMemberEmails });
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  })
})

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })