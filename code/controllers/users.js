import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    //request admin access
    const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
    //if not admin, deny
    if (!adminAuth.authorized) {
      return res.status(401).json({ error: adminAuth.cause }) // unauthorized
    }
    const users = await User.find();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
    if (!adminAuth.authorized) {
      const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
      if (!userAuth.authorized) {
        return res.status(401).json({ error: userAuth.cause })
      }
    }
    const user = await User.findOne({ username: req.params.username });
    return res.status(200).json({ data: user, message: "" });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    //check logged in
    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });
    if (!simpleAuth.authorized) {
      return res.status(401).json({ error: simpleAuth.cause });
    }

    const name = req.body.name; //group name
    const memberEmails = req.body.memberEmails; //member emails

    // check if group exists
    if (await Group.findOne({ name: name })) {
      return res.status(401).json({ error: "group already exists" });
    }

    //start creating groups//
    //categorize emails
    let alreadyInGroupMembersArray = [];
    let notFoundMembersArray = [];
    let canBeAddedMembersArray = [];
    for (const email of memberEmails) {
      let user = await User.findOne({ email: email });
      if (!user) {
        notFoundMembersArray.push(email);
        continue;
      }
      if ((await Group.findOne({ members: { $elemMatch: { email: email } } }))) {
        alreadyInGroupMembersArray.push(email);
        continue;
      }
      canBeAddedMembersArray.push({ email: email, user: user._id });
    }

    //check if at least one member can be added
    if (!canBeAddedMembersArray.length) {
      return res.status(401).json({ error: "no members available to add" });
    }

    //create and save
    const newGroup = await Group.create({
      name: name,
      members: canBeAddedMembersArray
    });
    await newGroup.save();

    return res.status(200).json({
      data: {
        group: newGroup,
        alreadyInGroup: alreadyInGroupMembersArray,
        membersNotFound: notFoundMembersArray
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    //check if authorized as admin
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.authorized) {
      return res.status(401).json({ error: adminAuth.cause });
    }

    //retreive groups
    let data = await Group.find({})
    let filter = data.map(v => Object.assign({}, { name: v.name, members: v.members }))
    return res.status(200).json({ data: filter });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {

    //check group exists
    let group = await Group.findOne({ name: req.params.name });
    if (!group) return res.status(401).json({ error: "group does not exist" });

    //authorize
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.authorized) {
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(m => { return m.email }) });
      if (!groupAuth.authorized) {
        return res.status(401).json({ error: groupAuth.cause });
      }
    }

    return res.status(200).json({
      data: {
        name: group.name,
        members: group.members
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
//expecting emails : [] in body

export const addToGroup = async (req, res) => {
  try {

    //check group exists
    let group = await Group.findOne({ name: req.params.name });
    if (!group) return res.status(401).json({ error: "group does not exist" });

    //retreive member emails
    const emailArray = req.body.emails.map(String);
    if (emailArray.length === 0) return res.status(401).json({ error: "no members to add" });

    //authorize
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.authorized) {
      const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(m => { return m.email }) });
      if (!groupAuth.authorized) {
        return res.status(401).json({ error: groupAuth.cause });
      }
    }

    //categorize emails
    let alreadyInGroupMembersArray = [];
    let notFoundMembersArray = [];
    let canBeAddedMembersArray = [];
    for (const email in members) {
      let user = await User.findOne({ email: email });
      if (!user) {
        notFoundMembersArray.push(email);
        continue;
      }
      if ((await Group.findOne({ 'members.email': email }))) {
        alreadyInGroupMembersArray.push(email);
        continue;
      }
      canBeAddedMembersArray.push({ email: email, user: user._id });
    }

    //check if at least one member can be added
    if (!canBeAddedMembersArray.length) {
      return res.status(401).json({ error: "no members available to add" });
    }







  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}