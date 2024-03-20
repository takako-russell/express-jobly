const { BadRequestError } = require("../expressError");
/**
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps JavaScript property names to their corresponding SQL column names
 * @return {Object} with two properties {sqlSetCols,dataToUpdate}
 * @example {userName: 'Papaya', age:45} => { setCols:'"username"=$1,"age"=$2',
 * values:['Papaya',32]} */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
