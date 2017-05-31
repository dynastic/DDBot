module.exports = {
    prefix() {
        var date = new Date();
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString('en-GB')}`;
    },

    log(content) {
        console.log(`[INFO] [${this.prefix()}] ${content}`);
    },

    error(content) {
        console.error(`[ERROR] [${this.prefix()}] ${content}`);
    },

    warn(content) {
        console.warn(`[WARN] [${this.prefix()}] ${content}`);
    },

    debug(content) {
        console.debug(`[DEBUG] [${this.prefix()}] ${content}`);
    },

    assert(condition, content) {
        console.assert(condition, `[ASSERTION] [${this.prefix()}] ${content}`);
    }
}