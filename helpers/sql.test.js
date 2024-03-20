const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("Tests if the function works with 1 update", function () {
    const result = sqlForPartialUpdate(
      { numEmployees: "someone1", logoUrl: "www.google.com" },
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      }
    );
    expect(result).toEqual({
      setCols: '"num_employees"=$1, "logo_url"=$2',
      values: ["someone1", "www.google.com"],
    });
  });

  test("Tests if the function works with 2 updates", function () {
    const result = sqlForPartialUpdate(
      { first_name1: "update1", first_name2: "update2" },
      { first_name2: "test2" }
    );
    expect(result).toEqual({
      setCols: '"first_name1"=$1, "test2"=$2',
      values: ["update1", "update2"],
    });
  });
});
