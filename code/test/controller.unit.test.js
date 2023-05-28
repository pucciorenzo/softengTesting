import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { createCategory, createTransaction, deleteCategory, getCategories, updateCategory } from '../controllers/controller';

import * as utils from '../controllers/utils';
import { registerAdmin } from '../controllers/auth';


jest.mock('../models/model');
jest.mock('../controllers/utils');


beforeEach(() => {
    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.countDocuments.mockClear();
    categories.deleteOne.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.updateMany.mockClear();
    transactions.prototype.save.mockClear();

    utils.verifyAuth.mockClear();
});

describe(
    "createCategory",
    () =>
        test('authorized and no error, should return saved category',
            async () => {

                const mockReq = {
                    body: {
                        type: "testType",
                        color: "testColor"
                    }
                }
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "category added"
                    }
                }

                utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: 'Authorized' } })
                jest.spyOn(categories.prototype, 'save').mockResolvedValue({ type: "testType", color: "testColor" });
                jest.spyOn(categories, 'find').mockResolvedValue({ type: "testType", color: "testColor" });

                await createCategory(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(categories.prototype.save).toHaveBeenCalledWith();
                //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith({ data: { type: "testType", color: "testColor" }, message: mockRes.locals.message });

            }
        ),

    test('not authorized, should return unauthorized',
        async () => {

            const mockReq = {
                body: {
                    type: "testType",
                    color: "testColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "unauthorized"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

            await createCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

        }
    ),

    test(
        'database saving error: should return error',
        async () => {

            const mockReq = {
                body: {
                    type: "testType",
                    color: "testColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "database saving error"
                }
            }

            //utils.verifyAuth = jest.fn(() => { return { authorized: true, cause: 'Authorized' } });
            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: 'Authorized' } });
            jest.spyOn(categories.prototype, 'save').mockRejectedValueOnce(new Error(mockRes.locals.message));
            jest.spyOn(categories, 'find').mockResolvedValue({ type: "testType", color: "testColor" });

            await createCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            //expect(categories.find).toHaveBeenCalledWith({ type: "testType" });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

        }
    ),



);


/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */

describe(
    "updateCategory",
    () =>
        test(
            "should return unauthorized",
            async () => {

                const mockReq = {
                    body: {
                        type: "testType",
                        color: "testColor"
                    }
                }
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "unauthorized"
                    }
                }

                utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

                await updateCategory(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            }
        ),

    test(
        "should return category does not exist",
        async () => {

            const mockReq = {
                params: {
                    type: "oldType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "category does not exist"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return null });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return new category exists",
        async () => {

            const mockReq = {
                params: {
                    type: "oldType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "new category exists"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 1 });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return 'database category update error'",
        async () => {

            const mockReq = {
                params: {
                    type: "oldType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: 'database category update error'
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { throw new Error(mockRes.locals.message) });
            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return database transaction update many error",
        async () => {

            const mockReq = {
                params: {
                    category: "oldType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "database transaction update many error"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { return "success" });
            transactions.updateMany.mockImplementationOnce(() => { throw new Error(mockRes.locals.message) });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
        }
    ),

    test(
        "should return update successful",
        async () => {

            const mockReq = {
                params: {
                    type: "oldType"
                },
                body: {
                    type: "newType",
                    color: "newColor"
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "category updated successfully."
                }
            }

            const mockUpdateMany = {
                modifiedCount: 5
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            categories.findOne.mockImplementationOnce(() => { return 1 }).mockImplementationOnce(() => { return 0 });
            categories.updateOne.mockImplementationOnce(() => { return "success" });
            transactions.updateMany.mockImplementationOnce(() => { return mockUpdateMany });

            await updateCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.params.type });
            expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: mockReq.params.type }, { type: mockReq.body.type });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ data: { count: 5 }, message: "category updated successfully." });
        }
    ),

)

describe("deleteCategory", () => {
    test(
        "should return unauthorized",
        async () => {

            const mockReq = {
                body: {
                    types: []
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "unauthorized"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

            await deleteCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

        });

    test(
        "should return empty categories",
        async () => {

            const mockReq = {
                body: {
                    types: []
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "empty categories"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })

            await deleteCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

        });


    test(
        "should return at least one type does not exist",
        async () => {

            const mockReq = {
                body: {
                    types: ["A", "B", "C", "D", "E", "F", "G"]
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "at least one type does not exist"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            jest.spyOn(categories, 'countDocuments')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            await deleteCategory(mockReq, mockRes);
            //expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "A" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "B" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "C" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "D" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "E" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "F" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "G" });
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            expect(mockRes.status).toHaveBeenCalledWith(401);

        }
    );

    test(
        "should return deleted successfully",
        async () => {

            const mockReq = {
                body: {
                    types: ["A", "B", "C", "D", "E", "F", "G"]
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "deleted successfully"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            jest.spyOn(categories, 'countDocuments')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

                .mockResolvedValueOnce(7)
                .mockResolvedValueOnce(6)
                .mockResolvedValueOnce(5)
                .mockResolvedValueOnce(4)
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1);

            jest.spyOn(categories, 'deleteOne')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

            jest.spyOn(categories, 'findOne').mockResolvedValueOnce({ type: "G", color: "G" });
            jest.spyOn(transactions, 'updateMany').mockResolvedValueOnce({ modifiedCount: 6 });


            await deleteCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "A" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "B" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "C" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "D" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "E" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "F" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "G" });
            expect(categories.countDocuments).toHaveBeenCalledTimes(7 + 7);
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "A" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "B" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "C" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "D" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "E" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "F" });

            expect(categories.findOne).toHaveBeenCalledTimes(1);
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: ["A", "B", "C", "D", "E", "F", "G"] } }, { type: "G" })

            expect(mockRes.json).toHaveBeenCalledWith({ data: { count: 6 }, message: mockRes.locals.message });
            expect(mockRes.status).toHaveBeenCalledWith(200);

        }
    );

    test(
        "should return caught error",
        async () => {

            const mockReq = {
                body: {
                    types: ["A", "B", "C", "D", "E", "F", "G"]
                }
            }
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                locals: {
                    message: "database error"
                }
            }

            utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: mockRes.locals.message } })
            jest.spyOn(categories, 'countDocuments')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

                .mockResolvedValueOnce(7)
                .mockResolvedValueOnce(6)
                .mockResolvedValueOnce(5)
                .mockResolvedValueOnce(4)
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1);

            jest.spyOn(categories, 'deleteOne')
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)

            jest.spyOn(categories, 'findOne').mockResolvedValueOnce({ type: "G", color: "G" });
            jest.spyOn(transactions, 'updateMany').mockRejectedValueOnce(new Error(mockRes.locals.message));


            await deleteCategory(mockReq, mockRes);
            expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "A" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "B" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "C" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "D" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "E" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "F" });
            expect(categories.countDocuments).toHaveBeenCalledWith({ type: "G" });
            expect(categories.countDocuments).toHaveBeenCalledTimes(7 + 7);
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "A" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "B" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "C" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "D" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "E" });
            expect(categories.deleteOne).toHaveBeenCalledWith({ type: "F" });

            expect(categories.findOne).toHaveBeenCalledTimes(1);
            expect(transactions.updateMany).toHaveBeenCalledWith({ type: { $in: ["A", "B", "C", "D", "E", "F", "G"] } }, { type: "G" })

            expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            expect(mockRes.status).toHaveBeenCalledWith(500);

        }
    );
});

describe(
    "getCategories",
    () => {
        test(
            "should return unauthorized",
            async () => {

                const mockReq = {

                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "unauthorized"
                    }
                }

                utils.verifyAuth.mockImplementation(() => { return { authorized: false, cause: mockRes.locals.message } })

                await getCategories(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            }
        );

        test(
            "should return empty array",
            async () => {

                const mockReq = {

                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "unauthorized"
                    }
                }

                const mockRetreivedCategories = [];

                utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: "authorized" } })
                jest.spyOn(categories, 'find').mockImplementationOnce(() => mockRetreivedCategories);

                await getCategories(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith([]);
            }
        );

        test(
            "should return categories array",
            async () => {

                const mockReq = {

                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "unauthorized"
                    }
                }

                const mockRetreivedCategories = [
                    { _id: 1, type: "A", color: "A" },
                    { _id: 1, type: "B", color: "B" },
                    { _id: 1, type: "C", color: "C" },
                    { _id: 1, type: "D", color: "D" },
                    { _id: 1, type: "E", color: "E" },
                    { _id: 1, type: "F", color: "F" },
                ];

                utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: "authorized" } })
                jest.spyOn(categories, 'find').mockImplementationOnce(() => mockRetreivedCategories);

                await getCategories(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith([
                    { type: "A", color: "A" },
                    { type: "B", color: "B" },
                    { type: "C", color: "C" },
                    { type: "D", color: "D" },
                    { type: "E", color: "E" },
                    { type: "F", color: "F" },
                ]);
            }
        );

        test(
            "should return caught error",
            async () => {

                const mockReq = {

                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "database error"
                    }
                }

                const mockRetreivedCategories = [
                    { _id: 1, type: "A", color: "A" },
                    { _id: 1, type: "B", color: "B" },
                    { _id: 1, type: "C", color: "C" },
                    { _id: 1, type: "D", color: "D" },
                    { _id: 1, type: "E", color: "E" },
                    { _id: 1, type: "F", color: "F" },
                ];

                utils.verifyAuth.mockImplementation(() => { return { authorized: true, cause: "authorized" } })
                jest.spyOn(categories, 'find').mockRejectedValueOnce(new Error(mockRes.locals.message));

                await getCategories(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Simple' });
                expect(mockRes.status).toHaveBeenCalledWith(500);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            }
        );

    }
)

describe(
    "createTransaction",
    () => {
        test(
            'User authorized, transaction created',
            async () => {
                const mockReq = {
                    params: {
                        username: "userA"
                    },
                    body: {
                        username: "userA",
                        type: "A",
                        amount: 1
                    }
                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "transaction created successfully"
                    }
                }

                const mockSavedData = {
                    _id: 1,
                    username: "userA",
                    type: "A",
                    amount: 1
                }

                utils.verifyAuth
                    .mockImplementationOnce(() => { return { authorized: false, cause: "unauthorized" } })
                    .mockImplementationOnce(() => { return { authorized: true, cause: "authorized" } })
                    ;
                jest.spyOn(transactions.prototype, 'save').mockResolvedValueOnce(mockSavedData);
                jest.spyOn(categories, 'findOne').mockResolvedValueOnce(1);

                await createTransaction(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
                expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
                expect(transactions.prototype.save).toHaveBeenCalled();
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith({ data: mockSavedData, message: mockRes.locals.message });
            }
        );

        test(
            'unauthorized',
            async () => {
                const mockReq = {
                    params: {
                        username: "userA"
                    },
                    body: {
                        username: "userA",
                        type: "A",
                        amount: 1
                    }
                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "unauthorized"
                    }
                }

                const mockSavedData = {
                    _id: 1,
                    username: "userA",
                    type: "A",
                    amount: 1
                }

                utils.verifyAuth
                    .mockImplementationOnce(() => { return { authorized: false, cause: "unauthorized" } })
                    .mockImplementationOnce(() => { return { authorized: false, cause: "unauthorized" } })
                    ;
                //jest.spyOn(transactions.prototype, 'save').mockResolvedValueOnce(mockSavedData);

                await createTransaction(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            }
        );

        test(
            'username mismatch, should return cannot add other user transaction',
            async () => {
                const mockReq = {
                    params: {
                        username: "userA"
                    },
                    body: {
                        username: "userB",
                        type: "A",
                        amount: 1
                    }
                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "cannot add other user's transaction"
                    }
                }

                const mockSavedData = {
                    _id: 1,
                    username: "userA",
                    type: "A",
                    amount: 1
                }

                utils.verifyAuth
                    .mockImplementationOnce(() => { return { authorized: true, cause: "authorized" } })
                    .mockImplementationOnce(() => { return { authorized: true, cause: "authorized" } })
                    ;
                //jest.spyOn(transactions.prototype, 'save').mockResolvedValueOnce(mockSavedData);

                await createTransaction(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });

            }
        );

        test(
            'should return category does not exist',
            async () => {
                const mockReq = {
                    params: {
                        username: "userA"
                    },
                    body: {
                        username: "userA",
                        type: "A",
                        amount: 1
                    }
                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "category does not exist"
                    }
                }

                const mockSavedData = {
                    _id: 1,
                    username: "userA",
                    type: "A",
                    amount: 1
                }

                utils.verifyAuth
                    .mockImplementationOnce(() => { return { authorized: false, cause: "unauthorized" } })
                    .mockImplementationOnce(() => { return { authorized: true, cause: "authorized" } })
                    ;
                jest.spyOn(categories, 'findOne').mockResolvedValueOnce(null);

                await createTransaction(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                //expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
                expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
                //expect(transactions.prototype.save).toHaveBeenCalled();
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
            }
        );

        test(
            'should return caught error',
            async () => {

                const mockReq = {
                    params: {
                        username: "userA"
                    },
                    body: {
                        username: "userA",
                        type: "A",
                        amount: 1
                    }
                }

                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                    locals: {
                        message: "database error"
                    }
                }

                utils.verifyAuth
                    .mockImplementationOnce(() => { return { authorized: false, cause: "authorized" } })
                    .mockImplementationOnce(() => { return { authorized: true, cause: "authorized" } })
                    ;
                jest.spyOn(categories, 'findOne').mockResolvedValueOnce(1);
                jest.spyOn(transactions.prototype, 'save').mockRejectedValueOnce(new Error(mockRes.locals.message));

                await createTransaction(mockReq, mockRes);
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'Admin' });
                expect(utils.verifyAuth).toHaveBeenCalledWith(mockReq, mockRes, { authType: 'User', username: mockReq.params.username });
                expect(categories.findOne).toHaveBeenCalledWith({ type: mockReq.body.type });
                expect(transactions.prototype.save).toHaveBeenCalled();
                //expect(transactions.prototype.save).toThrow();
                expect(mockRes.json).toHaveBeenCalledWith({ error: mockRes.locals.message });
                expect(mockRes.status).toHaveBeenCalledWith(500);

            }
        );


    })

describe("getAllTransactions", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUserByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
