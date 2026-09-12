export default {
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],
  '*.vue': ['eslint --fix'],
  '*.{css,scss}': ['prettier --write'],
}
