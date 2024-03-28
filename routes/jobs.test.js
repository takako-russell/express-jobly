"use strict";

const request = require("supertest");

const app = require("../app");

const {
  db,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  getTestJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newTitle",
    salary: 600,
    equity: "0.2",
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "newTitle",
        salary: 600,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c2",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
        title: 5,
        salary: 550,
        equity: "0.1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});
/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("Tests to get all jobs", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          title: "J2",
          salary: 250,
          equity: "0.2",
          companyHandle: "c2",
        },
        {
          title: "J3",
          salary: 300,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 250 });
    expect(resp.body).toEqual({
      jobs: [
        {
          companyHandle: "c2",
          equity: "0.2",
          salary: 250,
          title: "J2",
        },
        {
          title: "J3",
          salary: 300,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering on all filters", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ minSalary: 250, hasEquity: true, title: "J3" });
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "J3",
          salary: 300,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ minSalary: 100, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("Get a job", async function () {
    const id = getTestJobIds()[0];
    const resp = await request(app).get(`/jobs/${id}`);
    expect(resp.body).toEqual({
      job: {
        id: id,
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("found no such job", async function () {
    const resp = await request(app).get("/jobs/0");
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const id = getTestJobIds()[0];
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        salary: 150,
      })
      .set("authorization", `Bearer ${adminToken}`);
    console.log(resp.body);
    expect(resp.body).toEqual({
      job: {
        title: "J1",
        salary: 150,
        equity: "0.1",
        companyHandle: "c1",
        id: expect.any(Number),
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        salary: 250,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new title",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        salary: "not integer",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const id = getTestJobIds()[0];
    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: id });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth error without token", async function () {
    const resp = await request(app).delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
