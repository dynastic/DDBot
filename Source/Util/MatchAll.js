module.exports = (string, regex) => {
    let matches = [];
    let m;
    if (regex.global) {
        while (m = regex.exec(string)) {
            matches.push(m);
        }
    } else {
        if (m = regex.exec(string)) {
            matches.push(m);
        }
    }
    return matches;
};
