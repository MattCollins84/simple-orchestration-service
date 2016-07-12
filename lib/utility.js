const _ = require('underscore');
// obj - the object to check
// required - required fields
// otherData - do we require a tleast one more field? (bool)
const missing = function(obj, required, otherData) {

  var errors = [];

  // is 'obj' an object?
  if (_.isObject(obj)) {
    var keys = Object.keys(obj);
  }

  else {
    errors.push("Unexpected request body");
    return errors;
  }

  // have we got all off our required fields?
  if (_.isArray(required)) {

    required.forEach(r => {
      
      if (_.isUndefined(obj[r])) {
        errors.push(`${r} is required`);
      }

    });

    if (errors.length) {
      return errors;
    }

  }

  // do we need any other data?
  if (otherData === true && keys.length <= required.length) {
    errors.push(`You must supply at least one more parameter as well as ${required.join(', ')}`);
  }

  return errors;

}

const handleRes = function(err, data, req, res) {

  if (err) {
    return res.status(404).send({
      success: false,
      error: err
    });
  }

  return res.send({
    success: true,
    data: data
  })

}

module.exports = {
  missing: missing,
  handleRes: handleRes
}