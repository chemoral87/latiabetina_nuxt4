# TypeScript Migration & Code Quality Execution Plan

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 Update TypeScript Configuration
```bash
# Update tsconfig.json with strict settings
npm install -D typescript@latest @types/node @types/vue

# Create tsconfig.json with strict settings if it doesn't exist
```

### 1.2 Configure ESLint & Prettier
```bash
# Install required packages
npm install -D eslint@latest @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-vue@latest eslint-plugin-vue-scoped-css@latest \
  eslint-plugin-prettier prettier eslint-config-prettier

# Set up lint-staged for pre-commit hooks
npm install -D lint-staged husky@latest
```

### 1.3 Create Configuration Files

#### `.eslintrc.js`
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'vue', 'prettier'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'vue/no-unused-components': 'error',
    'vue/require-default-prop': 'error',
    'vue/no-multiple-template-root': 'off'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
}
```

#### `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "vueIndentScriptAndStyle": true,
  "arrowParens": "avoid"
}
```

#### `lint-staged.config.js`
```javascript
module.exports = {
  '*.{js,ts,vue}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss}': ['prettier --write']
}
```

### 1.4 Update package.json scripts
```json
{
  "scripts": {
    "lint": "eslint app --ext .vue,.js,.ts",
    "lint:fix": "eslint app --ext .vue,.js,.ts --fix",
    "type-check": "vue-tsc --noEmit",
    "format": "prettier --write \"**/*.{vue,js,ts,json,md}\"",
    "prepare": "husky"
  }
}
```

## Phase 2: Type Definitions & Interfaces (Week 2)

### 2.1 Create Type Definition Structure
```
app/types/
├── api/
│   ├── auth.ts          # Authentication API types
│   ├── user.ts          # User API types
│   ├── course.ts        # Course API types
│   ├── song.ts          # Song API types
│   └── pos.ts           # POS API types
├── models/
│   ├── user.ts          # User model interfaces
│   ├── course.ts        # Course model interfaces
│   ├── song.ts          # Song model interfaces
│   └── common.ts        # Common model interfaces
└── enums/
    ├── permissions.ts   # Permission enums
    ├── roles.ts         # Role enums
    └── status.ts        # Status enums
```

### 2.2 Create Core API Response Interfaces
```typescript
// app/types/api/common.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}
```

### 2.3 Create Authentication Types
```typescript
// app/types/api/auth.ts
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  permissions: string[]
  permissions_org: Record<string, number[]>
  orgs: Array<{
    id: number
    name: string
    type: string
  }>
}
```

## Phase 3: Component Migration (Weeks 3-4)

### 3.1 Migration Strategy

#### Priority 1: High-usage components
1. `app/layouts/default.vue` - Already migrated
2. `app/components/User/Table.vue`
3. `app/components/Song/Editor.vue`
4. `app/components/Pos/PosProductList.vue`
5. `app/components/Courses/Quiz/*.vue`

#### Priority 2: Authentication components
1. `app/pages/login.vue`
2. `app/pages/logout.vue`
3. `app/pages/dashboard.vue`

#### Priority 3: Business logic components
1. All components in `app/components/`
2. All pages in `app/pages/`

### 3.2 Migration Pattern Example

**Before (Options API):**
```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  methods: {
    greet() {
      console.log(this.message)
    }
  }
}
</script>
```

**After (Composition API with `<script setup>`):**
```vue
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
const message = ref<string>('Hello')

function greet(): void {
  console.log(message.value)
}

defineExpose({
  greet
})
</script>
```

### 3.3 Migration Utility Script

Create a migration helper script:
```typescript
// scripts/migrate-component.ts
import fs from 'fs'
import path from 'path'

interface MigrationOptions {
  componentPath: string
  outputPath?: string
  dryRun?: boolean
}

export function migrateComponent(options: MigrationOptions): boolean {
  // Implementation to convert Options API to Composition API
  // This is a complex task - better to do manually or use codemods
}
```

## Phase 4: Composables Type Safety (Week 5)

### 4.1 Typed Composables Pattern

```typescript
// app/composables/useTypedAuth.ts
import type { User, LoginRequest, LoginResponse } from '~/types/api/auth'

export function useTypedAuth() {
  const auth = useAuthStore()
  
  async function typedLogin(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    auth.setUser(response.user)
    return response
  }
  
  return {
    user: computed(() => auth.user as User | null),
    typedLogin,
    // other typed methods
  }
}
```

### 4.2 Update Existing Composables

1. `useAuth.ts` - Already has good typing, needs export consistency
2. `useApi.ts` - Add proper generics
3. `useSongEditorNotes.ts` - Add specific types
4. `useQuiz.ts` - Add quiz-specific types

## Phase 5: Strict TypeScript Configuration (Week 6)

### 5.1 Update `tsconfig.json` with strict settings

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "importsNotUsedAsValues": "error",
    "checkJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "types": ["vite/client", "vuetify"]
  },
  "include": [
    "./app/**/*",
    "./**/*.ts",
    "./**/*.vue"
  ],
  "exclude": [
    "node_modules",
    ".nuxt",
    "dist"
  ]
}
```

### 5.2 Fix Type Errors Incrementally

Run type checking and fix errors in batches:
```bash
# Run type checking
npm run type-check

# Fix errors by component groups:
# 1. Fix authentication components
# 2. Fix utility functions
# 3. Fix composables
# 4. Fix pages
# 5. Fix remaining components
```

## Phase 6: ESLint Rules & Code Quality (Week 7)

### 6.1 Custom ESLint Rules for Vue 3 Best Practices

Add to `.eslintrc.js`:
```javascript
rules: {
  'vue/component-api-style': ['error', ['script-setup', 'composition']],
  'vue/component-definition-name-casing': ['error', 'PascalCase'],
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/custom-event-name-casing': ['error', 'camelCase'],
  'vue/define-emits-declaration': ['error', 'type-based'],
  'vue/define-props-declaration': ['error', 'type-based'],
  'vue/html-comment-content-spacing': ['error', 'always'],
  'vue/no-empty-component-block': 'error',
  'vue/no-unused-refs': 'error',
  'vue/no-useless-v-bind': 'error',
  'vue/padding-line-between-blocks': ['error', 'always'],
  'vue/require-explicit-emits': 'error',
  'vue/require-expose': 'error',
  'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
  'vue/v-on-function-call': ['error', 'never'],
  
  // TypeScript specific
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
}
```

### 6.2 Add Pre-commit Hooks

Update `package.json`:
```json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

Initialize husky:
```bash
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run type-check && npm run test"
```

## Phase 7: Testing & Validation (Week 8)

### 7.1 Add Type Tests

```typescript
// app/types/__tests__/auth.test.ts
import type { User, LoginRequest } from '~/types/api/auth'

describe('Authentication Types', () => {
  test('User type has required properties', () => {
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      email_verified_at: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      permissions: ['user-index'],
      permissions_org: {},
      orgs: []
    }
    expect(user.id).toBe(1)
  })
  
  test('LoginRequest requires email and password', () => {
    const login: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    }
    expect(login.email).toBeDefined()
    expect(login.password).toBeDefined()
  })
})
```

### 7.2 Run Validation Checks

Create validation script:
```bash
#!/bin/bash
# scripts/validate-types.sh

echo "Running TypeScript validation..."
npm run type-check

echo "Running ESLint..."
npm run lint

echo "Running tests..."
npm run test

echo "Building project..."
npm run build
```

## Success Criteria

### Immediate (Week 1-2)
- [ ] TypeScript strict configuration implemented
- [ ] ESLint and Prettier configured
- [ ] Core type definitions created
- [ ] Pre-commit hooks working

### Short-term (Week 3-4)
- [ ] 50% of components migrated to `<script setup>`
- [ ] All API interfaces defined
- [ ] Composables properly typed
- [ ] No `any` types in new code

### Medium-term (Week 5-6)
- [ ] 90% of components migrated
- [ ] Strict TypeScript enabled
- [ ] All Vue files pass type checking
- [ ] ESLint rules enforced

### Long-term (Week 7-8)
- [ ] 100% migration complete
- [ ] Full type safety achieved
- [ ] All code follows Vue 3 best practices
- [ ] Automated quality checks in CI/CD

## Risk Mitigation

### Technical Risks
1. **Breaking changes**: Migrate incrementally, component by component
2. **Performance impact**: Test build times regularly
3. **Team adoption**: Provide training and documentation

### Process Risks
1. **Schedule slippage**: Weekly checkpoints and progress tracking
2. **Quality regression**: Maintain comprehensive test suite
3. **Integration issues**: Test with existing backend APIs

## Monitoring & Metrics

### Key Performance Indicators
- TypeScript compilation time
- Number of type errors
- ESLint warnings/errors count
- Test coverage percentage
- Build success rate

### Quality Gates
- Zero critical type errors before merge
- All new code must use `<script setup>`
- No `any` types allowed
- 100% ESLint compliance
- All tests passing

## Rollback Plan

If issues arise:
1. Revert to previous TypeScript config
2. Disable strict mode temporarily
3. Rollback problematic component migrations
4. Use feature flags for problematic changes