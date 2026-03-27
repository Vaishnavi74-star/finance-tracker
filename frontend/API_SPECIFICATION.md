# API Specification

## Authentication
- `POST /auth/register`: Register a new user
  - Body: `{ name, email, password }`
- `POST /auth/login`: Login user
  - Body: `{ email, password }`
- `GET /auth/me`: Get current user profile
- `PATCH /auth/me`: Update current user profile
  - Body: `{ name?, email?, currency? }`

## Transactions
- `GET /transactions`: Get all transactions
- `POST /transactions`: Create a new transaction
  - Body: `{ amount, type, category, date, description, recurringId? }`
- `PUT /transactions/:id`: Update a transaction
  - Body: `{ amount, type, category, date, description }`
- `DELETE /transactions/:id`: Delete a transaction (soft delete)

## Budgets
- `GET /budgets`: Get all budgets
- `POST /budgets`: Create a new budget
  - Body: `{ category, limit, period }`
- `PUT /budgets/:id`: Update a budget
  - Body: `{ limit, period }`
- `DELETE /budgets/:id`: Delete a budget (soft delete)

## Savings Goals
- `GET /goals`: Get all savings goals
- `POST /goals`: Create a new savings goal
  - Body: `{ name, targetAmount, currentAmount, deadline, icon }`
- `PUT /goals/:id`: Update a savings goal
  - Body: `{ name, targetAmount, currentAmount, deadline, icon }`
- `DELETE /goals/:id`: Delete a savings goal (soft delete)

## Recurring Transactions
- `GET /recurring`: Get all recurring transactions
- `POST /recurring`: Create a new recurring transaction
  - Body: `{ amount, type, category, frequency, nextDate, description }`
- `PUT /recurring/:id`: Update a recurring transaction
  - Body: `{ amount, type, category, frequency, nextDate, description }`
- `DELETE /recurring/:id`: Delete a recurring transaction (soft delete)

## Categories
- `GET /categories`: Get all categories
- `POST /categories`: Create a new category
  - Body: `{ name, icon, color }`
- `PUT /categories/:id`: Update a category
  - Body: `{ name, icon, color }`
- `DELETE /categories/:id`: Delete a category (soft delete)

## Notifications
- `GET /notifications`: Get all notifications
- `PATCH /notifications/:id/read`: Mark a notification as read
- `PATCH /notifications/read-all`: Mark all notifications as read
- `DELETE /notifications/:id`: Delete a notification (soft delete)

## AI Assistant
- `POST /ai/chat`: Chat with the AI assistant
  - Body: `{ messages: [{ role: 'user' | 'assistant', content: string }] }`
  - Response: Streaming text response
