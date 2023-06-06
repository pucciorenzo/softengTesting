import { Group, User } from '../models/User.js';
import { addToGroup, createGroup, deleteGroup, deleteUser, getGroup, getGroups, getUser, getUsers, removeFromGroup } from '../controllers/users.js';
import { verifyAuth } from '../controllers/utils.js';
import { transactions } from '../models/model.js';

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");
jest.mock("../models/model.js");

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.resetAllMocks();
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
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
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

  test("returns 500 error when error is thrown", async () => {

    //mock variables
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const errorMessage = "database error";
    const mockResStatus = 500;
    const mockResJson = { error: errorMessage }

    //mock implementations
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    User.find.mockRejectedValueOnce(new Error(errorMessage))

    //call function
    await getUsers(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(User.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })

  test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)  ", async () => {

    //mock variables
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const errorMessage = "unauthorized";
    const mockResStatus = 401;
    const mockResJson = { error: errorMessage }

    //mock implementations
    verifyAuth.mockReturnValueOnce({ flag: false, cause: errorMessage });

    //call function
    await getUsers(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });

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
      "user0@ezwallet.com",
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
        { email: "user0@ezwallet.com", user: "id0" },
        { email: "user1@ezwallet.com", user: "id1" },
        { email: "user4@ezwallet.com", user: "id4" },
      ]
    }
    const mockResData = {
      group: {
        name: mockName,
        members: [
          { email: "user0@ezwallet.com" },
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
      { _id: "id0", username: "user0", email: "user0@ezwallet.com", password: "hashedPassword0", role: "Regular" },
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
    Group.findOne.mockResolvedValueOnce(false);                   //group with name does not exist
    User.findOne.mockResolvedValueOnce(mockExistingUser);             //calling user exists
    Group.findOne.mockResolvedValueOnce(false);                   //calling user not group member
    User.findOne.mockResolvedValueOnce(mockUsers[1]);             //user exists
    Group.findOne.mockResolvedValueOnce(false);                   //user not group member
    User.findOne.mockResolvedValueOnce(mockUsers[2]);             //user exists
    Group.findOne.mockResolvedValueOnce(true);                    //user a group member
    User.findOne.mockResolvedValueOnce(false);                    //user does not exist
    User.findOne.mockResolvedValueOnce(mockUsers[3]);             //user exists
    Group.findOne.mockResolvedValueOnce(false);                   //user not group member
    User.findOne.mockResolvedValueOnce(mockUsers[4]);             //user exists
    Group.findOne.mockResolvedValueOnce(true);                    //user a group member
    User.findOne.mockResolvedValueOnce(false);                    //user does not exist
    Group.prototype.save.mockResolvedValueOnce(mockSavedGroup);   //save group

    //call function
    await createGroup(mockReq, mockRes);

    //tests
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Simple" });
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockName });
    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: mockReq.cookies.refreshToken });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockExistingUser.email } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[1] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[1] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[2] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[2] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[3] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[4] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[4] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[5] });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockMemberEmails[5] } } });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockMemberEmails[6] });
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
    const mockName = "group1";
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

describe("addToGroup", () => {
  test("should add to the group (user route)", async () => {

    //mock variables
    const mockName = "group1"
    const mockMemberEmails = [
      "user0@ezwallet.com",
      "user1@ezwallet.com",
    ]
    const mockEmails = [
      "user0@ezwallet.com",
      "user1@ezwallet.com",
      "user2@ezwallet.com",
      "user3@ezwallet.com",
      "user4@ezwallet.com",
      "user5@ezwallet.com",
      "user6@ezwallet.com",
      "user7@ezwallet.com",
    ]
    const mockUsers = [
      { _id: "id0", username: "user0", email: "user0@ezwallet.com", password: "hashedPassword0", role: "Regular" },
      { _id: "id1", username: "user1", email: "user1@ezwallet.com", password: "hashedPassword1", role: "Regular" },
      { _id: "id3", username: "user3", email: "user3@ezwallet.com", password: "hashedPassword3", role: "Regular" },
      { _id: "id4", username: "user4", email: "user4@ezwallet.com", password: "hashedPassword4", role: "Regular" },
      { _id: "id6", username: "user6", email: "user6@ezwallet.com", password: "hashedPassword6", role: "Regular" },
      { _id: "id7", username: "user7", email: "user7@ezwallet.com", password: "hashedPassword7", role: "Regular" },
    ]

    const mockSavedGroup = {
      _id: "id1", name: "group1", members: [
        { _id: "id0", email: "user0@ezwallet.com", user: "user_id0" },
        { _id: "id1", email: "user1@ezwallet.com", user: "user_id1" },
        { _id: "id4", email: "user4@ezwallet.com", user: "user_id4" },
        { _id: "id7", email: "user7@ezwallet.com", user: "user_id7" },
      ]
    }
    const mockGroup = {
      _id: "id1", name: "group1", members: [
        { _id: "id0", email: "user0@ezwallet.com", user: "user_id0" },
        { _id: "id1", email: "user1@ezwallet.com", user: "user_id1" }
      ],
      save: jest.fn().mockResolvedValueOnce(mockSavedGroup)
    }
    const mockReq = {
      url: "/api/groups/" + mockName + "/add",
      params: {
        name: mockName
      },
      body: {
        emails: mockEmails
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
      group: {
        name: mockName,
        members: [
          { email: "user0@ezwallet.com" },
          { email: "user1@ezwallet.com" },
          { email: "user4@ezwallet.com" },
          { email: "user7@ezwallet.com" },

        ]
      },
      alreadyInGroup: [
        { email: "user0@ezwallet.com" },
        { email: "user1@ezwallet.com" },
        { email: "user3@ezwallet.com" },
        { email: "user6@ezwallet.com" },
      ],
      membersNotFound: [
        { email: "user2@ezwallet.com" },
        { email: "user5@ezwallet.com" },
      ]
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    Group.findOne.mockResolvedValueOnce(mockGroup);                  //group with name exists
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" }); //authorized
    User.findOne.mockResolvedValueOnce(mockUsers[0]);           //user exists
    Group.findOne.mockResolvedValueOnce(true);                  //user in current group 
    User.findOne.mockResolvedValueOnce(mockUsers[1]);           //user exists
    Group.findOne.mockResolvedValueOnce(true);                  //user in current group 
    User.findOne.mockResolvedValueOnce(false);                  //user does not exists
    User.findOne.mockResolvedValueOnce(mockUsers[2]);           //user  exists
    Group.findOne.mockResolvedValueOnce(true);                  //user a group member
    User.findOne.mockResolvedValueOnce(mockUsers[3]);           //user exists
    Group.findOne.mockResolvedValueOnce(false);                 //user not a group member
    User.findOne.mockResolvedValueOnce(false);                  //user does not exists
    User.findOne.mockResolvedValueOnce(mockUsers[4]);           //user  exists
    Group.findOne.mockResolvedValueOnce(true);                  //user a group member
    User.findOne.mockResolvedValueOnce(mockUsers[5]);           //user exists
    Group.findOne.mockResolvedValueOnce(false);                 //user not a group member

    //call function
    await addToGroup(mockReq, mockRes);

    //tests
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockName });
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: mockMemberEmails });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[0] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[0] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[1] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[1] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[2] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[3] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[3] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[4] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[4] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[5] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[6] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[6] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[7] });
    expect(Group.findOne).toHaveBeenCalledWith({ 'members.email': mockEmails[7] });
    expect(mockGroup.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  })
})

describe("removeFromGroup", () => {
  test("should remove from the group (user route)", async () => {

    //mock variables
    const mockName = "group1"
    const mockEmails = [
      "user0@ezwallet.com",
      "user1@ezwallet.com",
      "user2@ezwallet.com",
      "user3@ezwallet.com",
      "user4@ezwallet.com",
      "user5@ezwallet.com",
      "user6@ezwallet.com",
    ]
    const mockUsers = [
      { _id: "id0", username: "user0", email: "user0@ezwallet.com", password: "hashedPassword0", role: "Regular" },
      { _id: "id1", username: "user1", email: "user1@ezwallet.com", password: "hashedPassword1", role: "Regular" },
      { _id: "id2", username: "user2", email: "user2@ezwallet.com", password: "hashedPassword2", role: "Regular" },
      { _id: "id3", username: "user3", email: "user3@ezwallet.com", password: "hashedPassword3", role: "Regular" },
      { _id: "id4", username: "user4", email: "user4@ezwallet.com", password: "hashedPassword4", role: "Regular" },
    ]
    const mockGroup = {
      _id: "id1", name: "group1", members: [
        { _id: "id0", email: "user0@ezwallet.com", user: "user_id0" },
        { _id: "id1", email: "user1@ezwallet.com", user: "user_id1" },
        { _id: "id2", email: "user2@ezwallet.com", user: "user_id2" },
      ],
      pull: jest.fn(),
      save: jest.fn()
    }
    mockGroup.members.pull = jest.fn();
    const mockMemberEmails = [
      "user0@ezwallet.com",
      "user1@ezwallet.com",
      "user2@ezwallet.com"
    ]
    const mockUpdatedGroup = {
      _id: "id1", name: "group1", members: [
        { _id: "id0", email: "user0@ezwallet.com", user: "user_id0" },
      ],
    }
    const mockToDeleteIds = [
      "id1",
      "id2",
    ]
    const mockReq = {
      url: "/api/groups/" + mockName + "/remove",
      params: {
        name: mockName
      },
      body: {
        emails: mockEmails
      },
      cookies: {
        refreshToken: "refresh token"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockResData = {
      group: {
        name: mockName,
        members: [
          { email: "user0@ezwallet.com" },
        ]
      },
      notInGroup: [
        { email: "user3@ezwallet.com" },
        { email: "user4@ezwallet.com" },
      ],
      membersNotFound: [
        { email: "user5@ezwallet.com" },
        { email: "user6@ezwallet.com" },
      ],
    }
    const mockResStatus = 200;
    const mockResJson = {
      data: mockResData
    }

    //mock implementations
    Group.findOne.mockResolvedValueOnce(mockGroup);                  //group with name exists
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" }); //authorized
    User.findOne.mockResolvedValueOnce(mockUsers[1]);
    User.findOne.mockResolvedValueOnce(mockUsers[2]);
    User.findOne.mockResolvedValueOnce(mockUsers[3]);
    User.findOne.mockResolvedValueOnce(mockUsers[4]);
    User.findOne.mockResolvedValueOnce(mockUsers[5]);
    User.findOne.mockResolvedValueOnce(mockUsers[6]);
    mockGroup.members.pull.mockReturnValueOnce(true)
    mockGroup.save.mockResolvedValueOnce(mockUpdatedGroup);

    //call function
    await removeFromGroup(mockReq, mockRes);

    //tests
    expect(Group.findOne).toHaveBeenCalledWith({ name: mockName });
    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Group", emails: mockMemberEmails });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[1] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[2] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[3] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[4] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[5] });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmails[6] });
    expect(mockGroup.members.pull).toHaveBeenCalledWith(...mockToDeleteIds);
    expect(mockGroup.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(mockResStatus)
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);
  })
})

describe("deleteUser", () => {
  test("should delete user and member in a group", async () => {

    //mock variables
    const mockEmail = "user0@ezwallet.com";
    const mockReq = {
      body: {
        email: mockEmail
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }
    const mockUser = { _id: "id0", username: "user0", email: "user0@ezwallet.com", password: "hashedPassword0", role: "Regular" };
    const mockGroup = {
      _id: "id1", name: "group1", members: [
        { _id: "id0", email: "user0@ezwallet.com", user: "user_id0" },
        { _id: "id1", email: "user1@ezwallet.com", user: "user_id1" },
      ],
      save: jest.fn()
    }
    mockGroup.members.pull = jest.fn();
    const mockDeletedTransactions = 5;
    const mockDeletedFromGroup = true;
    const mocKResStatus = 200;
    const mockResJson = {
      data:
      {
        deletedTransactions: mockDeletedTransactions,
        deletedFromGroup: mockDeletedFromGroup
      },
    }
    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    User.findOne.mockResolvedValueOnce(mockUser);
    User.deleteOne.mockResolvedValueOnce(true);
    transactions.deleteMany.mockResolvedValueOnce({ deletedCount: mockDeletedTransactions });
    Group.findOne.mockResolvedValueOnce(mockGroup);
    mockGroup.members.pull.mockReturnValueOnce(true);

    await deleteUser(mockReq, mockRes);

    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(User.deleteOne).toHaveBeenCalledWith(mockUser);
    expect(transactions.deleteMany).toHaveBeenCalledWith({ username: mockUser.username });
    expect(Group.findOne).toHaveBeenCalledWith({ members: { $elemMatch: { email: mockEmail } } });
    expect(mockGroup.members.pull).toHaveBeenCalledWith("id0");
    expect(mockRes.status).toHaveBeenCalledWith(mocKResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })
});

describe("deleteGroup", () => {
  test("should delete user and member in a group", async () => {
    //mock variables
    const mockName = "group1";
    const mockReq = {
      body: {
        name: mockName
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
      }
    }

    const mockMessage = "Group deleted successfully";
    const mocKResStatus = 200;
    const mockResJson = {
      data:
      {
        message: mockMessage
      },
    }

    verifyAuth.mockReturnValueOnce({ flag: true, cause: "authorized" });
    Group.deleteMany.mockResolvedValueOnce({ deletedCount: 1 });

    await deleteGroup(mockReq, mockRes);

    expect(verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: "Admin" });
    expect(Group.deleteMany).toHaveBeenCalledWith({ name: mockName });
    expect(mockRes.status).toHaveBeenCalledWith(mocKResStatus);
    expect(mockRes.json).toHaveBeenCalledWith(mockResJson);

  })
})