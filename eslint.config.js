export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**']
  },
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  }
]
