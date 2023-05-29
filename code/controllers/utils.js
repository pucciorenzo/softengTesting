import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 * 
 * API.md
 * handleDateFilterParams
Returns an object with a date attribute used for filtering mongoDB's aggregate queries
The value of date is an object that depends on the query parameters:
If the query parameters include from then it must include a $gte attribute that specifies the starting date as a Date object in the format YYYY-MM-DDTHH:mm:ss
Example: /api/users/Mario/transactions?from=2023-04-30 => {date: {$gte: 2023-04-30T00:00:00.000Z}}
If the query parameters include upTo then it must include a $lte attribute that specifies the ending date as a Date object in the format YYYY-MM-DDTHH:mm:ss
Example: /api/users/Mario/transactions?upTo=2023-05-10 => {date: {$lte: 2023-05-10T23:59:59.000Z}}
If both from and upTo are present then both $gte and $lte must be included
If date is present then it must include both $gte and $lte attributes, these two attributes must specify the same date as a Date object in the format YYYY-MM-DDTHH:mm:ss
Example: /api/users/Mario/transactions?date=2023-05-10 => {date: {$gte: 2023-05-10T00:00:00.000Z, $lte: 2023-05-10T23:59:59.000Z}}
If there is no query parameter then it returns an empty object
Example: /api/users/Mario/transactions => {}
Throws an error if date is present in the query parameter together with at least one of from or upTo
Throws an error if the value of any of the three query parameters is not a string that represents a date in the format YYYY-MM-DD
 */
export const handleDateFilterParams = (req) => {
  const { from, upTo, date } = req.query;

  const parseDateString = (str) => {
    return new Date(`${str}T00:00:00.000Z`);
  };

  if (date && (from || upTo)) {
    throw new Error('Cannot include date parameter with from or upTo parameters.');
  }

  if (date) {
    if(!validateParams(date, "handleDateFilterParams")) {
      throw new Error('Invalid date format. YYYY-MM-DD format expected.');
    }
    const parsedDate = parseDateString(date);
    const fromDate = new Date(parsedDate);
    const upToDate = new Date(parsedDate);
    upToDate.setHours(23, 59, 59, 999);
    return { date: { $gte: fromDate, $lte: upToDate } };
  }

  const filter = {};

  if (from) {
    if(!validateParams(from, "handleDateFilterParams")) {
      throw new Error('Invalid date format. YYYY-MM-DD format expected.');
    }
    const fromDate = parseDateString(from);
    filter.date = { ...(filter.date || {}), $gte: fromDate };
  }

  if (upTo) {
    if(!validateParams(upTo, "handleDateFilterParams")) {
      throw new Error('Invalid date format. YYYY-MM-DD format expected.');
    }
    const upToDate = parseDateString(upTo);
    upToDate.setHours(23, 59, 59, 999);
    filter.date = { ...(filter.date || {}), $lte: upToDate.toISOString() };
  }

  return filter;
};
  

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 * 
 */
/** new from api.md
 * verifyAuth
Verifies that the tokens present in the request's cookies allow access depending on the different criteria.
Returns an object with a boolean flag that specifies whether access is granted or not and a cause that describes the reason behind failed authentication
Example: {flag: false, cause: "Unauthorized"}
Refreshes the accessToken if it has expired and the refreshToken allows authentication; sets the refreshedTokenMessage to inform users that the accessToken must be changed
 */

export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { flag: false, cause: "Unauthorized" };
    }

    //if (!(await User.findOne({ refreshToken: refreshToken }))) return { flag: false, cause: "refresh token revoked. Did you log out?" };

    //start decoding tokens and refresh if needed
    let decodedAccessToken, decodedRefreshToken;
    try {
        //decode refresh token
        decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return { flag: false, cause: "Perform login again" };
        } else {
            return { flag: false, cause: err.name }
        }
    }

    try {
        //decode access token
        decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            const newAccessToken = jwt.sign({
                username: decodedRefreshToken.username,
                email: decodedRefreshToken.email,
                id: decodedRefreshToken.id,
                role: decodedRefreshToken.role
            }, process.env.ACCESS_KEY, { expiresIn: '1h' })
            res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
            res.locals.refreshedTokenMessage = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls';
            try {
                decodedAccessToken = jwt.verify(newAccessToken, process.env.ACCESS_KEY);
            }
            catch (err) {
                return { flag: false, cause: err.name }
            }
        }
    };


    if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
        return { flag: false, cause: "Token is missing information" }
    }
    if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
        return { flag: false, cause: "Token is missing information" }
    }
    if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
        return { flag: false, cause: "Mismatched token users" };
    }


    if (info.authType === 'Simple') {
        return { flag: true, cause: "Authorized" };
    }

    if (info.authType === 'User') {
        if (decodedAccessToken.username === req.params.username) {
            return { flag: true, cause: "Authorized" };
        }
        else {
            return { flag: false, cause: "Mismatched username" };
        }
    }

    if (info.authType === 'Admin') {
        if (decodedAccessToken.role === 'Admin') {
            return { flag: true, cause: "Authorized" };
        }
        else {
            return { flag: false, cause: "Not admin" };
        }
    }

    //const groupAuth = verifyAuth(req, res, {authType: "Group", emails: <array of emails>})
    if (info.authType === 'Group') {
        if (info.emails.includes(decodedAccessToken.email)) {
            return { flag: true, cause: "Authorized" };
        }
        else {
            return { flag: false, cause: "User not in group" };
        }
    }

    return { flag: false, cause: "unknown. Try again" };
}


/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 * 
 * From slack (added 2023/05/19)
 * the handleDateFilterParams and handleAmountFilterParams methods must return objects that can be used inside an aggregate function as part of its match stage. They must return an object that must be as shown in the example below:
const matchStage = {date: {$gte: 2023-04-30T00:00:00.000Z} } 
return matchStage
The code example shows the date as a string, but it must actually be a Date object created starting from the parameters (in format YYYY-MM-DD). Parameters used for filtering dates must go from 00:00(for $gte) or up to 23:59 (for $lte). Amount filtering simply requires integer values. All specifications on the parameters for filtering dates still apply (date cannot be present if at least one of from or upTo is also present).
 */
/**new from API.md
 * handleAmountFilterParams
Returns an object with an amount attribute used for filtering mongoDB's aggregate queries
The value of amount is an object that depends on the query parameters:
If the query parameters include min then it must include a $gte attribute that is an integer equal to min
Example: /api/users/Mario/transactions?min=10 => `{amount: {$gte: 10} }
If the query parameters include min then it must include a $lte attribute that is an integer equal to max
Example: /api/users/Mario/transactions?min=50 => `{amount: {$lte: 50} }
If both min and max are present then both $gte and $lte must be included
Throws an error if the value of any of the two query parameters is not a numerical value
 */
export const handleAmountFilterParams = (req) => {
  const { min, max } = req.query;

  if (min && max) {
    if(!validateParams(min, "handleAmountFilterParams"))
      throw new Error("Invalid min. Expected a numerical value.");
    if(!validateParams(max, "handleAmountFilterParams"))
      throw new Error("Invalid max. Expected a numerical value.");
    return {
      amount: {
        $gte: parseInt(min),
        $lte: parseInt(max),
      },
    };
  }

  if (min) {
    if(!validateParams(min, "handleAmountFilterParams"))
      throw new Error("Invalid min. Expected a numerical value.");
    return { amount: { $gte: parseInt(min) } };
  }

  if (max) {
    if(!validateParams(max, "handleAmountFilterParams"))
      throw new Error("Invalid max. Expected a numerical value.");
    return { amount: { $lte: parseInt(max) } };
  }

  return {};
};

export const validateParams = (toCheck, functionName) => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  switch(functionName){
    case "register":
    case "registerAdmin":
      return validateEmail(toCheck.query.email);
    case "createGroup":
      toCheck.query.memberEmails.forEach(email => {
        if(!validateEmail(email)) return false;
      });
      break;
    case "handleDateFilterParams":
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(toCheck);
    case "handleAmountFilterParams":
      return /^\d+$/.test(toCheck);
  }
}
