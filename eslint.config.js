import vue from 'eslint-plugin-vue'
import babelParser from '@babel/eslint-parser'

export default [
  {
    ignores: ['.nuxt/**', '.output/**', '.git/**'],
  },
  ...vue.configs['flat/base'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        // <script> blocks are parsed by Babel (strips TS types) because
        // typescript-eslint does not yet support this project's typescript@7.
        parser: babelParser,
        requireConfigFile: false,
        babelOptions: {
          presets: [['@babel/preset-typescript', { ignoreExtensions: true }]],
        },
      },
    },
  },
  {
    rules: {
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT'
          ],
          alphabetical: false // set true if you want alphabetical within groups
        }
      ]
    }
  }
]
