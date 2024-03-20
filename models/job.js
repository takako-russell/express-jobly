const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle}
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * return { id, handle, name, description, numEmployees, logoUrl }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS  "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  static async findAll(jobFilterCondition = {}) {
    const { title, minSalary, hasEquity } = jobFilterCondition;

    let query = `SELECT title, salary, equity, company_handle AS  "companyHandle"
    FROM jobs`;

    let values = [];
    let whereClauses = [];

    if (minSalary !== undefined) {
      values.push(minSalary);
      whereClauses.push(`salary >= $${values.length}`);
    }

    if (hasEquity === true) {
      whereClauses.push(`equity > 0`);
    }

    if (title) {
      values.push(`%${title}%`);
      whereClauses.push(`title LIKE $${values.length}`);
    }
    if (whereClauses.length > 0)
      query += " WHERE " + whereClauses.join(" AND ");

    query += " ORDER BY title";

    const jobsRes = await db.query(query, values);
    return jobsRes.rows;
  }

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,title,salary,equity,company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = " $" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,title,salary,equity,company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }

  static async getByCompanyHandle(company_handle) {
    const jobsRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle
         FROM jobs
         WHERE company_handle = $1`,
      [company_handle]
    );

    return jobsRes.rows;
  }
}

module.exports = Job;
