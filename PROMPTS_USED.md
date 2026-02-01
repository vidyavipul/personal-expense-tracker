# Prompts Used

This document lists the AI prompts and assistance used during the development of this project.

## AI Tool Used

**GitHub Copilot** (Claude Opus 4.5) - VS Code extension

## Prompts Used During Development

### 1. Initial Project Setup

**Purpose**: To initialize the project structure based on the screening task PDF requirements.

### 2. Adding Missing Components
```
check if anything is missing in src folder
```
**Purpose**: Discovered empty folders (middleware, utils, types) and added necessary implementation files.

### 3. Bug Fix - Duplicate Index Warning
```
I'm getting "DeprecationWarning: Duplicate key 'email'" when creating users
```
**Purpose**: Fixed duplicate index definition in User model by removing redundant `userSchema.index()` call.

### 4. Bug Fix - TypeScript Error
```
Error: Property 'code' does not exist on type 'Error'
```
**Purpose**: Fixed TypeScript error in error handler by using proper type guard: `'code' in err && (err as { code: number }).code === 11000`

### 5. Testing Setup
```
Add Jest tests for all the API endpoints
```
**Purpose**: Set up Jest with mongodb-memory-server for isolated testing environment. Created 9 test cases covering all endpoints.

### 6. MongoDB Connection Issue
```
MongooseServerSelectionError: Could not connect to MongoDB Atlas - IP not whitelisted
```
**Purpose**: Debugged MongoDB Atlas connection issue and resolved by adding IP address to Atlas Network Access whitelist.

### 7. Missing Routes Bug
```
Routes are returning 404 for getUserExpenses and summary endpoints
```
**Purpose**: Fixed missing route definitions in expenseRoutes.ts and added summary route to the main routes file.

### 8. Documentation
```
Create comprehensive API documentation and testing guides
```
**Purpose**: Generated README.md with API documentation, testing guides, and MongoDB Compass connection instructions.

## Development Approach

- **Core Logic**: Implemented manually with understanding of Express.js, Mongoose, and TypeScript patterns
- **Bug Fixing**: Used AI assistance to identify and resolve specific errors
- **Project Structure**: Used AI guidance for best practices in folder organization
- **Documentation**: AI-assisted in creating comprehensive README and testing guides
- **Code Review**: All generated code was reviewed and understood before committing
- **Testing**: Wrote tests with AI assistance for proper test structure and edge cases

## Areas Where AI Assisted

1. **TypeScript Configuration** - Guidance on tsconfig.json settings for Node.js/Express
2. **Mongoose Middleware** - Examples and patterns for pre-save, pre-validate hooks
3. **Error Handling** - Best practices for global error middleware with Mongoose errors
4. **Testing Setup** - Configuration for Jest with TypeScript and mongodb-memory-server
5. **Bug Resolution** - Debugging MongoDB connection issues, TypeScript errors, missing routes
6. **Documentation** - Structuring comprehensive README with API examples
7. **Git Workflow** - Maintaining meaningful commit messages throughout development

## Notes

- All implementations follow Node.js/Express best practices and Mongoose patterns
- Code was written with proper understanding of TypeScript, async/await, and error handling
- Mongoose middleware was implemented as per task requirements with pre-save and pre-validate hooks
- Testing was done both with Jest (automated) and manual API testing with curl/Postman
- MongoDB Atlas was configured and tested with real data using MongoDB Compass
