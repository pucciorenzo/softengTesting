import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { createValueTypeObject, removeDuplicates, resData, resError, validateValueType, validateValueTypes } from "../helpers/extraUtils.js";
import { verifyAuth } from "./utils.js";

/**
getUsers
Request Parameters: None
Request Body Content: None
Response data Content: An array of objects, each one having attributes username, email and role
Example: res.status(200).json({data: [{username: "Mario", email: "mario.red@email.com", role: "Regular"}, {username: "Luigi", email: "luigi.red@email.com", role: "Regular"}, {username: "admin", email: "admin@email.com", role: "Regular"} ], refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getUsers = async (req, res) => {
  try {

    //authenticate admin
    const auth = verifyAuth(req, res, { authType: 'Admin' });
    if (!auth.flag) return resError(res, 401, auth.cause) // unauthorized

    //retreive users list
    const data = (await User.find({})).map(user => {
      //prepare data
      return { username: user.username, email: user.email, role: user.role }
    });

    //send data
    resData(res, data);

  } catch (error) {
    return resError(res, 500, error.message);
  }
}

/**
getUser
Request Parameters: A string equal to the username of the involved user
Example: /api/users/Mario
Request Body Content: None
Response data Content: An object having attributes username, email and role.
Example: res.status(200).json({data: {username: "Mario", email: "mario.red@email.com", role: "Regular"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the username passed as the route parameter does not represent a user in the database
Returns a 401 error if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)
 */
export const getUser = async (req, res) => {
  try {

    //authenticate
    const auth = verifyAuth(req, res, { authType: 'Admin' });
    if (!auth.flag) {
      const auth = verifyAuth(req, res, { authType: "User", username: req.params.username });
      if (!auth.flag) return resError(res, 401, auth.cause)
    }

    //retreive user
    const user = await User.findOne({ username: req.params.username });
    if (!user) return resError(res, 400, "user not found");

    return resData(res, { username: user.username, email: user.email, role: user.role });

  } catch (error) {
    return resError(res, 500, error.message);
  }
}

/**
createGroup
Request Parameters: None
Request request body Content: An object having a string attribute for the name of the group and an array that lists all the memberEmails
Example: {name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com"]}
Response data Content: An object having an attribute group (this object must have a string attribute for the name of the created group and an array for the members of the group), an array that lists the alreadyInGroup members (members whose email is already present in a group) and an array that lists the membersNotFound (members whose email does not appear in the system)
Example: res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})
If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the group name passed in the request body is an empty string
Returns a 400 error if the group name passed in the request body represents an already existing group in the database
Returns a 400 error if all the provided emails (the ones in the array, the email of the user calling the function does not have to be considered in this case) represent users that are already in a group or do not exist in the database
Returns a 400 error if the user who calls the API is already in a group
Returns a 400 error if at least one of the member emails is not in a valid email format
Returns a 400 error if at least one of the member emails is an empty string
Returns a 401 error if called by a user who is not authenticated (authType = Simple)
 */

export const createGroup = async (req, res) => {
  try {

    //authenticate
    const auth = verifyAuth(req, res, { authType: "Simple" });
    if (!auth.flag) return resError(res, 401, auth.cause);

    //get attributes
    const name = req.body.name;
    let memberEmails = req.body.memberEmails;

    const validation = validateValueTypes([
      createValueTypeObject(name, 'string'),
      createValueTypeObject(memberEmails, 'emailArray')
    ]);
    if (!validation.flag) return resError(res, 400, validation.cause);

    // check if group exists
    if (await Group.findOne({ name: name })) return resError(res, 400, "group already exists");

    //check if calling user exists
    const existingUser = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (!existingUser) return resError(res, 400, "calling user does not exist");

    //check if calling user already in a group
    if (await Group.findOne({ members: { $elemMatch: { email: existingUser.email } } })) return resError(res, 400, "calling user already in group");

    //remove duplicate emails
    const uniqueEmails = {};
    for (const email of memberEmails) uniqueEmails[email] = email;
    memberEmails = Object.keys(uniqueEmails);

    //categorize other emails except calling user
    let canBeAddedMembersArray = [];
    let alreadyInGroupMembersArray = [];
    let notFoundMembersArray = [];
    memberEmails = memberEmails.filter(mE => mE != existingUser.email); //exclude calling user
    for (const email of memberEmails) {

      //check user exists
      let user = await User.findOne({ email: email });
      if (!user) {
        //notFoundMembersArray.push({ email: email });
        notFoundMembersArray.push(email);
        continue;
      }
      //check user not in group
      if (await Group.findOne({ members: { $elemMatch: { email: email } } })) {
        //alreadyInGroupMembersArray.push({ email: email });
        alreadyInGroupMembersArray.push(email);
        continue;
      }
      //prepare to add
      canBeAddedMembersArray.push({ email: email, user: user._id });

    }

    //check if at least one member other than caller can be added
    if (canBeAddedMembersArray.length == 0) return resError(res, 400, "no members available to add");
    canBeAddedMembersArray.unshift({ email: existingUser.email, user: existingUser._id });

    //create and save
    const newGroup = new Group({
      name: name,
      members: canBeAddedMembersArray
    });
    //console.log(JSON.stringify(newGroup, null, 2));
    await newGroup.save()
      .then(data =>
        //prepare and send data
        resData(res, {
          group: {
            name: data.name,
            members: data.members.map(m => { return { email: m.email } })
          },
          alreadyInGroup: alreadyInGroupMembersArray,
          membersNotFound: notFoundMembersArray
        }));

  } catch (error) {
    return resError(res, 500, error.message);
  }
}

/**
getGroups
Request Parameters: None
Request Body Content: None
Response data Content: An array of objects, each one having a string attribute for the name of the group and an array for the members of the group
Example: res.status(200).json({data: [{name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}] refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const getGroups = async (req, res) => {
  try {
    //check if authorized as admin
    const auth = verifyAuth(req, res, { authType: "Admin" });
    if (!auth.flag) return resError(res, 401, auth.cause);

    //retreive groups
    let data = await Group.find({});
    let filter = data.map(v => Object.assign({}, { name: v.name, members: v.members.map(m => { return { email: m.email } }) }));
    return resData(res, filter);

  } catch (error) {
    resError(res, 500, error.message);
  }
}


/**
getGroup
Request Parameters: A string equal to the name of the requested group
Example: /api/groups/Family
Request Body Content: None
Response data Content: An object having a string attribute for the name of the group and an array for the members of the group
Example: res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}} refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
Returns a 401 error if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
 */
export const getGroup = async (req, res) => {
  try {

    let group, memberEmails;



    //authenticate admin
    const auth = verifyAuth(req, res, { authType: "Admin" });
    if (auth.flag) {

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

      //get member emails
      memberEmails = group.members.map(m => m.email);

    }
    //authenticate user, check group first
    else {

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

      //get member emails
      memberEmails = group.members.map(m => m.email);

      const auth = verifyAuth(req, res, { authType: "Group", emails: memberEmails });

      if (!auth.flag) return resError(res, 401, auth.cause);
    }


    //prepare and send data
    return resData(res, { group: { name: group.name, members: memberEmails.map(mE => { return { email: mE } }) } });

  } catch (error) {
    return resError(res, 500, error.message);
  }
}


/**
addToGroup
Request Parameters: A string equal to the name of the group
Example: api/groups/Family/add (user route)
Example: api/groups/Family/insert (admin route)
Request Body Content: An array of strings containing the emails of the members to add to the group
Example: {emails: ["pietro.blue@email.com"]}
Response data Content: An object having an attribute group (this object must have a string attribute for the name of the created group and an array for the members of the group, this array must include the new members as well as the old ones), an array that lists the alreadyInGroup members (members whose email is already present in a group) and an array that lists the membersNotFound (members whose email does not appear in the system)
Example: res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]}, membersNotFound: [], alreadyInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})
In case any of the following errors apply then no user is added to the group
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
Returns a 400 error if all the provided emails represent users that are already in a group or do not exist in the database
Returns a 400 error if at least one of the member emails is not in a valid email format
Returns a 400 error if at least one of the member emails is an empty string
Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/add
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/insert
 */

export const addToGroup = async (req, res) => {
  try {

    let group;

    //authenticate//
    if (req.url.includes("/insert")) {

      const auth = verifyAuth(req, res, { authType: "Admin" });
      if (!auth.flag) return resError(res, 401, auth.cause);

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

    }
    //user route
    else if (req.url.includes("/add")) {

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

      //user route
      const auth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(m => { return m.email }) });
      if (!auth.flag) return resError(res, 401, auth.cause);

      //admin route
    }
    //unknown route
    else throw new Error('unknown route');

    //get attributes
    let emailArray = req.body.emails;

    //validate attributes
    const validation = validateValueType(createValueTypeObject(emailArray, 'emailArray'));
    if (!validation.flag) return resError(res, 400, validation.cause);

    emailArray = removeDuplicates(emailArray);

    //categorize emails
    let alreadyInGroupMembersArray = [];
    let notFoundMembersArray = [];
    let canBeAddedMembersArray = [];
    for (const email of emailArray) {

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
    if (canBeAddedMembersArray.length == 0) return resError(res, 400, "no members available to add");

    //add to group and send
    group.members.push(...canBeAddedMembersArray);
    await group.save()
      .then(data =>
        //prepare data
        resData(res,
          {
            group: {
              name: data.name,
              members: data.members.map(m => { return { email: m.email } })
            },
            alreadyInGroup: alreadyInGroupMembersArray,//.map(email => { return { email: email } }),
            membersNotFound: notFoundMembersArray,//.map(email => { return { email: email } })
          }
        ));

  } catch (error) {
    return resError(res, 500, error.message);
  }
}

/**
removeFromGroup
Request Parameters: A string equal to the name of the group
Example: api/groups/Family/remove (user route)
Example: api/groups/Family/pull (admin route)
Request Body Content: An array of strings containing the emails of the members to remove from the group
Example: {emails: ["pietro.blue@email.com"]}
Response data Content: An object having an attribute group (this object must have a string attribute for the name of the created group and an array for the members of the group, this array must include only the remaining members), an array that lists the notInGroup members (members whose email is not in the group) and an array that lists the membersNotFound (members whose email does not appear in the system)
Example: res.status(200).json({data: {group: {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}, membersNotFound: [], notInGroup: []} refreshedTokenMessage: res.locals.refreshedTokenMessage})
In case any of the following errors apply then no user is removed from the group
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the group name passed as a route parameter does not represent a group in the database
Returns a 400 error if all the provided emails represent users that do not belong to the group or do not exist in the database
Returns a 400 error if at least one of the emails is not in a valid email format
Returns a 400 error if at least one of the emails is an empty string
Returns a 400 error if the group contains only one member before deleting any user
Returns a 401 error if called by an authenticated user who is not part of the group (authType = Group) if the route is api/groups/:name/remove
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) if the route is api/groups/:name/pull
 
//don't delete the first member of the group.
*/
export const removeFromGroup = async (req, res) => {
  try {

    let group, memberEmails;

    //authenticate//
    //admin route
    if (req.url.includes("/pull")) {

      const auth = verifyAuth(req, res, { authType: "Admin" });
      if (!auth.flag) return resError(res, 401, auth.cause);

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

      //get current member emails
      memberEmails = group.members.map(m => m.email);


    }
    //user route
    else if (req.url.includes("/remove")) {

      //check group exists
      group = await Group.findOne({ name: req.params.name });
      if (!group) return resError(res, 400, "group does not exist");

      //get current member emails
      memberEmails = group.members.map(m => m.email);

      const auth = verifyAuth(req, res, { authType: "Group", emails: memberEmails });
      if (!auth.flag) return resError(res, 401, auth.cause);

    }
    //unknown route
    else throw new Error('unknown route')

    //check group has more than one members
    if (memberEmails.length == 1) return resError(res, 400, "Only one member in group");

    //get attributes
    let emailArray = req.body.emails;

    //validate attributes
    const validation = validateValueType(createValueTypeObject(emailArray, 'emailArray'));
    if (!validation.flag) return resError(res, 400, validation.cause);

    //remove duplicate emails
    const uniqueEmails = {};
    for (const email of emailArray) uniqueEmails[email] = email;
    emailArray = Object.keys(uniqueEmails);

    //categorize emails excluding first member//
    let notInGroupMembersArray = [];
    let notFoundMembersArray = [];
    let canBeRemovedMembersArray = [];
    //emailArray = emailArray.filter(e => e != memberEmails[0]); //exclude first member
    for (const email of emailArray) {

      //user exists
      if (!await User.findOne({ email: email })) {
        notFoundMembersArray.push(email);
        continue;
      }

      //user is in group
      if (!memberEmails.includes(email)) {
        notInGroupMembersArray.push(email);
        continue;
      }

      // added for deletion
      canBeRemovedMembersArray.push(email);

    }

    //if all members set to be removed, exclude oldest
    if (canBeRemovedMembersArray.length == memberEmails.length)
      canBeRemovedMembersArray = canBeRemovedMembersArray.filter(e => e != memberEmails[0]); //exclude first member

    //check if at least one member can be removed
    if (canBeRemovedMembersArray.length == 0) {
      return resError(res, 400, "no members to remove");
    }

    //get member ids to remove
    let memberIdsToRemove = group.members.filter(m => canBeRemovedMembersArray.includes(m.email)).map(m => m._id);

    group.members.pull(...memberIdsToRemove);
    await group.save()
      .then(data =>
        resData(res, {
          group: {
            name: data.name,
            members: data.members.map(m => { return { email: m.email } })
          },
          notInGroup: notInGroupMembersArray,//.map(email => { return { email: email } }),
          membersNotFound: notFoundMembersArray,//.map(email => { return { email: email } })
        })
      );

  } catch (error) {
    //console.log(error)
    return resError(res, 500, error.message);
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
deleteUser
Request Parameters: None
Request Body Content: A string equal to the email of the user to be deleted
Example: {email: "luigi.red@email.com"}
Response data Content: An object having an attribute that lists the number of deletedTransactions and an attribute that specifies whether the user was also deletedFromGroup or not
Example: res.status(200).json({data: {deletedTransactions: 1, deletedFromGroup: true}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
If the user is the last user of a group then the group is deleted as well
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the email passed in the request body is an empty string
Returns a 400 error if the email passed in the request body is not in correct email format
Returns a 400 error if the email passed in the request body does not represent a user in the database
Returns a 400 error if the email passed in the request body represents an admin
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteUser = async (req, res) => {
  try {

    //authenticate
    const auth = verifyAuth(req, res, { authType: "Admin" });
    if (!auth.flag) return resError(res, 401, auth.cause);

    //get attribute
    const email = req.body.email;

    //validate attribute
    const validation = validateValueType(createValueTypeObject(email, "email"));
    if (!validation.flag) return resError(res, 400, validation.cause);

    //check user exists
    const user = await User.findOne({ email: email });
    if (!user) return resError(res, 400, "user not found");

    //check user not admin
    if (user.role == "Admin") return resError(res, 400, "cannot delete admin");

    await User.deleteOne(user);

    const deletedTransaction = (await transactions.deleteMany({ username: user.username })).deletedCount;

    let deletedFromGroup = false;
    const group = await Group.findOne({ members: { $elemMatch: { email: email } } });
    if (group) {

      const membersCount = group.members.length;

      if (membersCount == 1) await Group.deleteOne(group);

      if (membersCount > 1) {

        group.members.pull(group.members.find(m => m.email == email)._id);
        await group.save();

      }
      deletedFromGroup = true;

    }
    return resData(res, {
      deletedTransactions: deletedTransaction,
      deletedFromGroup: deletedFromGroup
    });

  } catch (error) {
    return resError(res, 500, error.message);
  }
}

/**
deleteGroup
Request Parameters: None
Request Body Content: A string equal to the name of the group to be deleted
Example: {name: "Family"}
Response data Content: A message confirming successful deletion
Example: res.status(200).json({data: {message: "Group deleted successfully"} , refreshedTokenMessage: res.locals.refreshedTokenMessage})
Returns a 400 error if the request body does not contain all the necessary attributes
Returns a 400 error if the name passed in the request body is an empty string
Returns a 400 error if the name passed in the request body does not represent a group in the database
Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteGroup = async (req, res) => {
  try {

    const auth = verifyAuth(req, res, { authType: "Admin" });
    if (!auth.flag) return resError(res, 401, auth.cause);

    //get attribute
    const name = req.body.name;

    //validate attribute
    const validation = validateValueType(createValueTypeObject(name, "string"));
    if (!validation.flag) return resError(res, 400, validation.cause);

    const deletedCount = (await Group.deleteOne({ name: name })).deletedCount;
    if (!deletedCount) return resError(res, 400, "group does not exist");

    return resData(res, { message: "Group deleted successfully" });

  } catch (error) {
    resError(res, 500, error.message);
  }

}