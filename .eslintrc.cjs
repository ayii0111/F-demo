/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {

rules: {
  semi: 0, // 關閉js檔中分號的檢查
  quotes: 0, // 關閉強迫使用單引號
  camelcase: 0, // 關閉強制使用駝峰式命名
  'vue/multi-word-component-names': 0, // 關閉強制使用駝峰式命名
  'vuejs-accessibility/label-has-for': 0, // 關閉label莫名報錯
  'space-before-function-paren': 0, // 括號前出現空格
  'max-len': 0, // 代碼行字數上限
  'vuejs-accessibility/form-control-has-label': 0, // 表單要有label來增加可讀性
  'import/no-extraneous-dependencies': 0, // main.js引用非依賴軟件時的警告
  'import/prefer-default-export': 0, // 關閉舉報預設匯出
  '@typescript-eslint/no-unused-vars': 0 // 宣告未立即使用的變數警告
},
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    './eslintrc-auto-import.json',
    'plugin:you-dont-need-lodash-underscore/compatible'
  ],
  overrides: [
    {
      files: [
        'e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:playwright/recommended'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
