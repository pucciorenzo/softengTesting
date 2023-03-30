import request from 'supertest';
import { app } from '../app'; // Assuming you have an app.js file where you import and use the routes
import User from '../models/User.js';

describe("getUsers", () => {
  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]

    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual(retrievedUsers)
  })

  test("should return an empty array if there are no users", async () => {
    jest.spyOn(User, "find").mockImplementation(() => [])
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test("should return a 500 error in case of error", async () => {
    jest.spyOn(User, "find").mockRejectedValue(new Error("Server error"))
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(500)
    expect(response.text).toEqual('\"Server error\"')
  })
})

describe("getUserByUsername", () => {
  test("should retrieve information of a user given his/her username", async () => {
    const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
    jest.spyOn(User, "findOne").mockResolvedValue(retrievedUser)
    const response = await request(app)
      .get("/api/users/" + retrievedUser.username)
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(retrievedUser)
  })

  test("should return a 401 error if accessed without authorization", async () => {
    const response = await request(app)
      .get("/api/users/" + "test1")

    expect(response.status).toBe(401)
  })

  test("should return a 401 error if the requested user does not exist", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null)
    const response = await request(app)
      .get("/api/users/" + "test1")
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(401)
  })

  test("should return a 500 error in case of error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValue(new Error("Server error"))
    const response = await request(app)
      .get("/api/users/" + "test1")
      .set('Cookie', 'accessToken=validAccessToken;refreshToken=validRefreshToken')

    expect(response.status).toBe(500)
    expect(response.text).toEqual('\"Server error\"')
  })
})