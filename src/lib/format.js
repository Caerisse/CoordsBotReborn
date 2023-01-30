module.exports = {
  format(originalString, map) {
    let string = originalString;
    Object.keys(map).forEach((key) => {
      string = string.replace(new RegExp(`\\{${key}\\}`, 'gm'), map[key]);
    });
    return string;
  },
};
