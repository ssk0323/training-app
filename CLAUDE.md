# Training Record App - Development Guide

## Project Overview
個人利用のトレーニング記録アプリです。スマートフォンからの利用を重視し、無料で運用できる構成を目指します。

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PWA** - Progressive Web App capabilities

### Backend & Infrastructure
- **Cloudflare Workers** - Serverless runtime
- **Cloudflare D1** - SQLite-based database
- **Cloudflare Pages** - Static site hosting

### Testing & Development
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **ESLint** + **Prettier** - Code formatting and linting

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, etc.)
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API calls and business logic
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── __tests__/          # Test files
├── functions/              # Cloudflare Workers functions
├── migrations/             # Database migrations
├── public/                 # Static assets
└── tests/                  # E2E tests
```

## Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run preview            # Preview production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run E2E tests
npm run test:coverage      # Generate coverage report

# Database
npm run db:migrate         # Run database migrations
npm run db:seed            # Seed database with sample data

# Deployment
npm run deploy             # Deploy to Cloudflare Pages
npm run deploy:functions   # Deploy Cloudflare Workers

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format code with Prettier
npm run typecheck          # TypeScript type checking
```

## Code Style

### TypeScript
- Use strict TypeScript configuration
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type

### React
- Use functional components with hooks
- Prefer custom hooks for complex logic
- Use `React.memo()` for performance optimization when needed
- Keep components small and focused

### Naming Conventions
- Components: PascalCase (`TrainingRecord.tsx`)
- Files/folders: kebab-case (`training-record/`)
- Functions/variables: camelCase (`getUserTraining`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### File Organization
- Group related files in feature folders
- Keep components close to where they're used
- Separate business logic from UI components

## TDD Workflow

### Test-First Development
1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

### Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

### Test Structure
```typescript
describe('TrainingRecord', () => {
  it('should display previous record when creating new entry', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI (for Cloudflare)

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Database Setup
```bash
# Create local D1 database
npx wrangler d1 create training-app-db

# Run migrations
npm run db:migrate
```

## API Design

### RESTful Endpoints
- `GET /api/trainings` - Get training list
- `POST /api/trainings` - Create training record
- `GET /api/trainings/:id` - Get specific training
- `PUT /api/trainings/:id` - Update training record
- `GET /api/menus` - Get training menus
- `POST /api/menus` - Create training menu

### Data Models
```typescript
interface TrainingMenu {
  id: string;
  name: string;
  description: string;
  scheduledDays: string[]; // ['monday', 'wednesday', 'friday']
}

interface TrainingRecord {
  id: string;
  menuId: string;
  date: string;
  sets: TrainingSet[];
  comment?: string;
}

interface TrainingSet {
  weight: number;
  reps: number;
  duration?: number; // seconds
}
```

## Do Not

- **No complex state management** - Use React's built-in state and context
- **No unnecessary dependencies** - Keep bundle size minimal
- **No inline styles** - Use Tailwind CSS classes
- **No console.log in production** - Use proper logging
- **No hardcoded values** - Use environment variables
- **No tests without assertions** - Every test must verify behavior
- **No large components** - Split into smaller, focused components
- **No direct DOM manipulation** - Use React's declarative approach
- **No mutations** - Prefer immutable data patterns
- **No skipping tests** - Run tests before committing

## Development Notes

- Mobile-first responsive design
- Offline capability with PWA
- Fast loading and smooth UX
- Accessibility considerations (a11y)
- Performance monitoring and optimization