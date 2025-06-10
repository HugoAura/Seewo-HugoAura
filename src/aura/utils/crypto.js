/**
 *
 * @returns {string}
 */
const genRandomHex = () => {
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomNum = Math.floor(Math.random() * 0x10000);
    result += randomNum.toString(16).padStart(4, "0");
  }
  return result;
};

module.exports = { genRandomHex };
