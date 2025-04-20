module.exports = {
  extends: ['react-app', 'react-app/jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'testing-library/no-render-in-setup': 'off',
    'testing-library/no-node-access': 'off'
  }
}; 