import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";


/**
API return content
All data returned by APIs must be a JSON object with the following structure:
{
  "data": { "param": "returned data" },
  "message": "message"
}
where data represents the content that the API is expected to return (array, object, value...) and message is an optional message that is stored in the parameter res.locals.message.
*/


/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        const { type, color } = req.body;
        const new_categories = new categories({ type, color });
        await new_categories.save() //auto throws duplicate type error
            .then(data => res.status(200).json({ data: data, message: "category added" }))
            .catch(err => { throw err });
        //let data = await categories.find({ type: type })
        //return res.json({data : data, message : "category added"});
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        //request admin access
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        //if not admin, deny
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        // get old type from parameter
        const oldType = req.params.type;
        //get new type and its color from parameter
        const { type, color } = req.body;
        let result;
        //if category to modify does not exist
        result = await categories.findOne({ type: oldType });
        if (!result) return res.status(401).json({ error: "category does not exist" });
        //if changing type,
        if (type != oldType) {
            //if the new type already exist, return 401 error
            result = await categories.findOne({ type: type });
            if (result) return res.status(401).json({ error: "new category exists" });
        }
        //update type
        result = await categories.updateOne({ type: oldType }, { type: type, color: color });
        //update transactions with new type
        result = await transactions.updateMany({ type: oldType }, { type: type });
        //return successful and transactions update count
        return res.status(200).json({ data: { count: result.modifiedCount }, message: "category updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
    
it can delete more than one category as it receives an array of types
it must return with an error if there is at least one type in the array that does not exist
at least one category must remain in the database after deletion (if there are three categories in the database and the method is called to delete all the categories, then the first category in the database cannot be deleted)
all the transactions that have a category that is deleted must have their category changed to the first category type rather than to the default category. Transactions with a category that does not exist are not fetched by the aggregate method, which performs a join operation.

 */
export const deleteCategory = async (req, res) => {
    try {
        //verify admin
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        //verify non empty delete list
        const typeArray = req.body.types.map(String);
        if (typeArray.length === 0) return res.status(401).json({ error: "empty categories" });
        let result;
        //check all categories to be deleted exist
        for (const type of typeArray) {
            const result = await categories.countDocuments({ type: type });
            if (!result) {
                return res.status(401).json({ error: "at least one type does not exist" });
            }
        }
        //delete categories, keep atleast one
        for (let type of typeArray) {
            //only when more than one categories remain
            if (await categories.countDocuments() > 1) {
                await categories.deleteOne({ type: type });
            }
        };
        //get first category in database
        const firstCategory = await categories.findOne({});
        //replace all deleted types in transaction with first type
        result = await transactions.updateMany({ type: { $in: typeArray } }, { type: firstCategory.type });
        //get modified count and return with successful message
        const count = result.modifiedCount;
        return res.status(200).json({ data: { count: count }, message: "deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth = verifyAuth(req, res, { authType: 'Simple' });
        if (!simpleAuth.authorized) {
            return res.status(401).json({ error: simpleAuth.cause }) // unauthorized
        }
        let data = await categories.find({})
        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))
        return res.status(200).json({ data: filter });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        const { username, amount, type } = req.body;
        if (username != req.params.username) return res.status(401).json({ error: "cannot add other user's transaction" });
        if (!(await categories.findOne({ type: type }))) {
            return res.status(401).json({ error: "category does not exist" });
        }
        const new_transactions = new transactions({ username, amount, type });
        await new_transactions.save()
            .then(data => res.status(200).json({ data: data, message: "transaction created successfully" }))
            .catch(err => { throw err });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        //verify admin
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }

        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: req.params.username
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 401 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }

        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $match: {
                    username: req.params.username,
                    type: req.params.category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
//router.get("/transactions/groups/:name", getTransactionsByGroup)
export const getTransactionsByGroup = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */
        let group = await Group.findOne({ name: req.params.name });
        if (!group) return res.status(401).json("group does not exist");

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => { return member.email }) });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            }
            , {
                $match: {
                    username: {
                        $in: group.members.map(async (member) => { return (await User.findOne({ email: member.email })) })
                    }
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        /* if (req.url.indexOf("/transactions/users/") >= 0) {
         } else {
         }
         */
        let group = await Group.findOne({ name: req.params.name });
        if (!group) return res.status(401).json("group does not exist");
        let category = await categories.findOne({ name: req.params.category });
        if (!category) return res.status(401).json("category does not exist");

        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const groupAuth = verifyAuth(req, res, { authType: "Group", emails: group.members.map(member => { return member.email }) });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        //user self access and admin any access
        /**
        * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
        */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            }
            , {
                $match: {
                    username: {
                        $in: group.members.map(member => { return member.user.username })
                    },
                    type: req.params.category
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.json(data);
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
            if (!userAuth.authorized) {
                return res.status(401).json({ error: userAuth.cause })
            }
        }
        let user = User.findOne({ name: req.params.username });
        if (!user) return res.status(401).json("user does not exist");
        let transaction = await transactions.findOne({ username: user.username, _id: req.params._id });
        if (!transaction) return res.status(401).json("transaction does not exist");
        await transactions.deleteOne({ _id: req.params._id });
        return res.json("deleted successfully")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: 'Admin' });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause })
        }
        const ids = req.body._ids;
        ids.forEach(async id => {
            let transaction = await transactions.findOne({ _id: req.params._id });
            if (!transaction) return res.status(401).json("at least one transaction does not exist");
        })
        ids.forEach(async id => {
            await transactions.deleteOne({ _id: req.params._id });
        })
        return res.json("all trnasactions deleted succsssfully")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
