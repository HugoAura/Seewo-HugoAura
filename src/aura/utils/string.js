const checkIfNonAscii = (str) => {
  return Buffer.byteLength(str) !== str.length;
};

module.exports = { checkIfNonAscii };
