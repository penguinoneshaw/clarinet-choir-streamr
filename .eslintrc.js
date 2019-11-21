module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": [
        'plugin:prettier/recommended'],
    "parserOptions": {
        "ecmaVersion": 2018,
        sourceType: 'module',  // Allows for the use of imports
    },
};