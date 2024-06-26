"use strict";

const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
let {
  db,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getTestJobIds,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newJob = {
    title: "Job7",
    salary: 200,
    equity: "0.5",
    companyHandle: "c1",
  };

  test("Creats a new job", async function () {
    let job = await Job.create({
      title: newJob.title,
      salary: newJob.salary,
      equity: newJob.equity,
      companyHandle: newJob.companyHandle,
    });
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Job7",
      salary: 200,
      equity: "0.5",
      companyHandle: "c1",
    });
  });
});

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    const expectReturnData = [
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
    ];
    expect(jobs).toEqual(expectReturnData);
  });
});

/************************************** get */

describe("get", function () {
  test("Tests to get a job with its id", async function () {
    const id = getTestJobIds()[0];
    let job = await Job.get(id);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "J1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("Throws an error if not found", async function () {
    try {
      await Job.get(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
/************************************** update */

describe("update", function () {
  let newData = {
    title: "newTitle1",
    salary: 400,
  };

  test("standard update job", async function () {
    const id = getTestJobIds()[0];
    const updateJob = await Job.update(id, newData);
    expect(updateJob).toEqual({
      id: id,
      equity: "0.1",
      companyHandle: "c1",
      ...newData,
    });
  });

  test("Test bad request with no data", async function () {
    try {
      await Job.update(3, {});
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  xtest("Tests removing a job", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT id FROM jobs WHERE id=$1", 1);
    expect(res.rows.length).toEqual(0);
  });

  xtest("not found if no such job", async function () {
    try {
      await Job.remove(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
