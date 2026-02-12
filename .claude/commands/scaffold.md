# /scaffold - Generate Project Structure

You are a senior developer setting up a new project structure based on approved architecture documentation.

## Prerequisites

Before running this command, ensure:
- `/architect` has been executed
- Architecture documents exist in `docs/`:
  - `PRD.md`
  - `ARCHITECTURE.md`
  - `TECH_STACK.md`
  - `DATA_MODEL.md`
- User has reviewed and approved the architecture

---

## Your Task

Generate a complete, working project structure based on the architecture documents. This includes:

1. **Directory structure**
2. **Configuration files**
3. **Dependency management**
4. **Boilerplate code**
5. **Development setup instructions**

---

## Step 1: Read Architecture Documents

First, read all architecture documents:

```bash
# Read these files
docs/PRD.md
docs/ARCHITECTURE.md
docs/TECH_STACK.md
docs/DATA_MODEL.md
```

Extract key information:
- Technology stack (frontend, backend, database)
- Architecture style (monolith, microservices, etc.)
- Data models and entities
- Third-party integrations

---

## Step 2: Create Directory Structure

Based on the architecture, create an appropriate directory structure.

### Example: Full-Stack Web App (Monolith)

```
project-name/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── [entity_models].py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── [route_files].py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── [service_files].py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── error_handler.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── connection.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── settings.py
│   │   └── main.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_models.py
│   │   └── test_routes.py
│   ├── alembic/              # If using SQL migrations
│   │   └── versions/
│   ├── requirements.txt      # or pyproject.toml
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts        # or webpack config
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── DATA_MODEL.md
│   └── API.md                # API documentation
│
├── .claude/
│   ├── commands/
│   └── settings.json
│
├── .gitignore
├── docker-compose.yml        # If using Docker
├── Dockerfile               # If using Docker
├── README.md
└── LICENSE
```

### Example: Microservices Architecture

```
project-name/
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── api-service/
│   │   └── [similar structure]
│   └── worker-service/
│       └── [similar structure]
│
├── frontend/
│   └── [same as above]
│
├── shared/
│   └── types/
│
├── infrastructure/
│   ├── docker-compose.yml
│   └── k8s/
│
└── docs/
    └── [architecture docs]
```

**Adapt the structure based on the tech stack in TECH_STACK.md**

---

## Step 3: Generate Configuration Files

Create necessary configuration files based on the tech stack:

### Backend (Python/FastAPI example)

**`backend/requirements.txt`** or **`backend/pyproject.toml`**:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-dotenv==1.0.0
# Add other dependencies from TECH_STACK.md
```

**`backend/.env.example`**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
DEBUG=true
```

**`backend/src/config/settings.py`**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

### Frontend (React/TypeScript example)

**`frontend/package.json`**:
```json
{
  "name": "project-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**`frontend/tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`frontend/.env.example`**:
```env
VITE_API_URL=http://localhost:8000
```

### Docker (if specified in architecture)

**`docker-compose.yml`**:
```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dbname
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/dbname
    depends_on:
      - db
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
```

### Git

**`.gitignore`**:
```
# Environment variables
.env
.env.local

# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Build outputs
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
.claude/logs/

# Database
*.db
*.sqlite

# Testing
.coverage
htmlcov/
.pytest_cache/
```

---

## Step 4: Generate Boilerplate Code

Create minimal working code based on data models from DATA_MODEL.md

### Backend Models (Python/SQLAlchemy example)

**`backend/src/models/base.py`**:
```python
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime
from datetime import datetime

Base = declarative_base()

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

**`backend/src/models/[entity].py`** (for each entity in DATA_MODEL.md):
```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Entity(Base, TimestampMixin):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    # Add fields from DATA_MODEL.md
    name = Column(String, nullable=False)
    # ...
```

### Backend Routes (FastAPI example)

**`backend/src/main.py`**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes import entity_routes

app = FastAPI(title="Project API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(entity_routes.router, prefix="/api/v1", tags=["entities"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**`backend/src/routes/entity_routes.py`**:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.entity import Entity

router = APIRouter()

@router.get("/entities", response_model=List[dict])
def get_entities(db: Session = Depends(get_db)):
    return db.query(Entity).all()

@router.post("/entities", response_model=dict)
def create_entity(data: dict, db: Session = Depends(get_db)):
    entity = Entity(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity
```

### Frontend Components (React/TypeScript example)

**`frontend/src/App.tsx`**:
```typescript
import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>Welcome to Project Name</h1>
      <p>Your application is ready to build!</p>
    </div>
  )
}

export default App
```

**`frontend/src/services/api.ts`**:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`)
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  }
}
```

---

## Step 5: Generate README Files

### Root README.md

```markdown
# [Project Name]

[Brief description from PRD.md]

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ (or database from TECH_STACK.md)
- Docker & Docker Compose (optional)

## Quick Start

### Option 1: Using Docker

\`\`\`bash
# Start all services
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
\`\`\`

### Option 2: Manual Setup

#### Backend

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (if applicable)
alembic upgrade head

# Start server
uvicorn src.main:app --reload
\`\`\`

#### Frontend

\`\`\`bash
cd frontend
npm install

# Setup environment
cp .env.example .env

# Start dev server
npm run dev
\`\`\`

## Project Structure

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Development

- **API Documentation:** http://localhost:8000/docs (when running)
- **Frontend:** http://localhost:5173
- **Database:** Connection details in .env

## Testing

\`\`\`bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
\`\`\`

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Technology Stack](docs/TECH_STACK.md)
- [Data Model](docs/DATA_MODEL.md)

## Contributing

[Add contributing guidelines]

## License

[Add license information]
```

---

## Step 6: Initialize ADW Structure

Add the ADW-specific directories:

```bash
mkdir -p specs/
mkdir -p agents/
```

Ensure `.claude/` structure is in place with all commands.

---

## Step 7: Verify & Report

After generating all files:

1. **List all created files** in a tree structure
2. **Verify completeness**:
   - All dependencies listed
   - All config files created
   - Boilerplate code matches data models
   - README has clear setup instructions
3. **Report to user**:
   - Files created
   - Next steps to get started
   - Any manual configuration needed

---

## Important Guidelines

- **Match the architecture exactly** - Don't deviate from approved docs
- **Use modern best practices** - Latest stable versions, proper project structure
- **Make it runnable** - User should be able to run it immediately
- **Don't over-scaffold** - Create foundations, not complete features
- **Include helpful comments** - Especially in config files
- **Validate data models** - Ensure entities from DATA_MODEL.md are properly implemented
- **Consider the stack** - Python uses venv, Node uses node_modules, etc.

---

## Adaptation Guidelines

### If Stack is Different

- **Go backend:** Use `go.mod`, proper package structure
- **Node.js backend:** Use `package.json`, Express/Fastify/Nest.js patterns
- **Next.js frontend:** Use Next.js app router structure
- **Vue frontend:** Use Vue 3 composition API structure
- **Svelte frontend:** Use SvelteKit structure
- **Mobile (React Native):** Use Expo or bare React Native structure

### If Architecture is Different

- **Microservices:** Create separate service directories
- **Serverless:** Create Lambda function structure
- **Monorepo:** Use workspace configuration (npm workspaces, pnpm, turborepo)

---

## Example Output

After successful scaffolding:

```
✅ Project structure created successfully!

📁 Created Files:
backend/
├── src/
│   ├── models/ (3 files)
│   ├── routes/ (2 files)
│   ├── services/ (1 file)
│   ├── config/ (1 file)
│   └── main.py
├── tests/
├── requirements.txt
├── .env.example
└── README.md

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md

Root:
├── docker-compose.yml
├── .gitignore
└── README.md

🚀 Next Steps:

1. Review the generated structure
2. Copy .env.example to .env and configure
3. Install dependencies:
   - Backend: cd backend && pip install -r requirements.txt
   - Frontend: cd frontend && npm install
4. Start development:
   - Docker: docker-compose up
   - Manual: Follow instructions in README.md

5. Begin feature development:
   claude -p "/feature" -- "User authentication"

📖 Documentation generated in docs/
```

---

**Remember:** The goal is to create a solid foundation that the user can immediately start building upon!
