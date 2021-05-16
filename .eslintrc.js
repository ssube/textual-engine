module.exports = {
  "env": {
    "es6": true
  },
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "eslint-plugin-chai",
    "eslint-plugin-chai-expect",
    "eslint-plugin-chai-expect-keywords",
    "eslint-plugin-import",
    "eslint-plugin-mocha",
    "eslint-plugin-no-null",
    "eslint-plugin-sonarjs",
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "rules": {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": [
      "error",
      {
        "default": "generic"
      }
    ],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "null": "Use 'undefined' instead of 'null'"
        }
      }
    ],
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        "accessibility": "explicit",
        "overrides": {
          "constructors": "no-public"
        }
      }
    ],
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        "FunctionDeclaration": {
          "parameters": "first"
        },
        "FunctionExpression": {
          "parameters": "first"
        },
        "ObjectExpression": "first",
        "SwitchCase": 1
      }
    ],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/member-ordering": [
      "error",
      {
        "default": [
          "public-static-method",
          "public-static-field",
          "public-instance-field",
          "protected-instance-field",
          "public-constructor",
          "public-instance-method",
          "protected-instance-method"
        ]
      }
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "format": [
          "camelCase"
        ],
        "leadingUnderscore": "forbid",
        "selector": "default",
        "trailingUnderscore": "forbid"
      },
      {
        "format": [
          "camelCase",
          "UPPER_CASE"
        ],
        "leadingUnderscore": "forbid",
        "selector": "variable",
        "trailingUnderscore": "forbid"
      },
      {
        "format": [
          "PascalCase"
        ],
        "leadingUnderscore": "forbid",
        "selector": "typeLike",
        "trailingUnderscore": "forbid"
      },
      {
        "format": [
          "PascalCase"
        ],
        "leadingUnderscore": "forbid",
        "selector": "interface",
        "trailingUnderscore": "forbid"
      },
      {
        "format": [
          "camelCase",
          "PascalCase"
        ],
        "leadingUnderscore": "forbid",
        "selector": "function",
        "trailingUnderscore": "forbid"
      },
      {
        "format": [
          "PascalCase",
          "UPPER_CASE"
        ],
        "leadingUnderscore": "forbid",
        "selector": "enumMember",
        "trailingUnderscore": "forbid"
      }
    ],
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-parameter-properties": "error",
    "@typescript-eslint/no-redeclare": [
      "error"
    ],
    "@typescript-eslint/no-shadow": [
      "error"
    ],
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-use-before-declare": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/quotes": [
      "error",
      "single",
      {
        "avoidEscape": true
      }
    ],
    "@typescript-eslint/restrict-plus-operands": "error",
    "@typescript-eslint/semi": [
      "error",
      "always"
    ],
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/type-annotation-spacing": "error",
    "@typescript-eslint/unbound-method": "error",
    "@typescript-eslint/unified-signatures": "error",
    "arrow-body-style": "error",
    "arrow-parens": [
      "error",
      "always"
    ],
    "camelcase": "error",
    "complexity": [
      "error",
      {
        "max": 12
      }
    ],
    "constructor-super": "error",
    "curly": "error",
    "default-case": "error",
    "dot-notation": "error",
    "eol-last": "error",
    "eqeqeq": [
      "error",
      "always"
    ],
    "guard-for-in": "error",
    "id-blacklist": [
      "error",
      "any",
      "Number",
      "String",
      "Boolean",
      "Undefined"
    ],
    "id-match": "error",
    "import/no-default-export": "error",
    "import/no-deprecated": "error",
    "import/no-extraneous-dependencies": "off",
    "import/no-internal-modules": "off",
    "import/order": [
      "error",
      {
        "groups": [
          [
            "builtin",
            "external"
          ],
          [
            "index",
            "parent",
            "sibling",
            "unknown"
          ]
        ]
      }
    ],
    "max-classes-per-file": [
      "off",
      1
    ],
    "max-len": [
      "error",
      {
        "code": 180
      }
    ],
    "max-lines": [
      "error",
      500
    ],
    "max-params": [
      "error",
      4
    ],
    "new-parens": "error",
    "no-bitwise": "off",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "error",
    "no-debugger": "error",
    "no-duplicate-case": "error",
    "no-duplicate-imports": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-extra-bind": "error",
    "no-fallthrough": "off",
    "no-invalid-this": "error",
    "no-irregular-whitespace": "error",
    "no-magic-numbers": [
      "error",
      {
        "ignoreArrayIndexes": true,
        "ignore": [
          -1,
          0,
          1,
          10,
          100,
          1000
        ]
      }
    ],
    "no-multiple-empty-lines": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-null/no-null": "error",
    "no-param-reassign": "error",
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "WithStatement",
      "MemberExpression[optional=true]",
      "IfStatement[alternate.type='IfStatement']",
      "UnaryExpression[operator='!']",
      "BinaryExpression[operator='!=='][right.value=true]"
    ],
    "no-return-await": "error",
    "no-sequences": "error",
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "error",
    "no-unsafe-finally": "error",
    "no-unused-expressions": "error",
    "no-unused-labels": "error",
    "no-useless-constructor": "error",
    "no-var": "error",
    "no-void": "error",
    "object-shorthand": "error",
    "one-var": [
      "error",
      "never"
    ],
    "prefer-const": "error",
    "prefer-object-spread": "error",
    "quote-props": [
      "error",
      "consistent-as-needed"
    ],
    "radix": "error",
    "sonarjs/cognitive-complexity": "error",
    "sonarjs/max-switch-cases": "error",
    "sonarjs/no-all-duplicated-branches": "error",
    "sonarjs/no-collapsible-if": "error",
    "sonarjs/no-collection-size-mischeck": "error",
    "sonarjs/no-duplicate-string": "error",
    "sonarjs/no-duplicated-branches": "error",
    "sonarjs/no-element-overwrite": "error",
    "sonarjs/no-identical-conditions": "error",
    "sonarjs/no-identical-expressions": "error",
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-inverted-boolean-check": "error",
    "sonarjs/no-redundant-boolean": "error",
    "sonarjs/no-redundant-jump": "error",
    "sonarjs/no-same-line-conditional": "error",
    "sonarjs/no-useless-catch": "error",
    "sonarjs/prefer-immediate-return": "error",
    "space-before-function-paren": [
      "error",
      {
        "anonymous": "never",
        "asyncArrow": "always",
        "named": "never"
      }
    ],
    "space-in-parens": [
      "error",
      "never"
    ],
    "spaced-comment": "error",
    "use-isnan": "error",
    "valid-typeof": "off"
  }
}