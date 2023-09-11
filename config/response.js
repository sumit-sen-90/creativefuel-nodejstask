let returnTrue = (req, res, message, arr) =>
  res.status(200).json({ success: true, message: message, data: arr });

let returnFalse = (req, res, message, arr) =>
  res.status(200).json({ success: false, message: message, data: arr });

let response = {
  returnFalse: returnFalse,
  returnTrue: returnTrue,
};

module.exports = response;
