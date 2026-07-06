---
description: 
---

# Development Workflow

## Step 1

Understand the feature.

Read related pages.

Read related APIs.

Read related models.

Read related routes.

Read reusable components.

Do not start coding immediately.

---

## Step 2

Think.

Plan the implementation.

Identify

Database

Backend

Frontend

Permissions

Validation

Edge cases

Future scalability

---

## Step 3

Reuse existing code.

Prefer extending existing modules.

Avoid creating duplicate utilities.

---

## Step 4

Implement backend first.

Create

Model

Migration

Controller

Route

Validation

Permissions

Audit logs if applicable.

---

## Step 5

Implement frontend.

Use

Material UI

Responsive layout

Existing API service

Existing reusable components

Existing dialogs

Existing theme

---

## Step 6

Improve UX.

Always include

Loading

Empty states

Skeletons

Helpful messages

Confirmation dialogs

Snackbars

---

## Step 7

Review implementation.

Check

Security

Performance

Accessibility

Maintainability

Scalability

---

## Step 8

Test manually.

Test

Desktop

Tablet

Mobile

Slow network

Empty database

Large dataset

Permission failures

Validation failures

---

## Step 9

Optimize.

Remove duplication.

Reduce unnecessary renders.

Improve naming.

Improve readability.

---

## Step 10

Self Review.

Before marking complete, answer:

Did I reuse existing code?

Did I duplicate logic?

Is this responsive?

Is this scalable?

Will this work for 10 students?

Will this work for 10,000 students?

Would a senior engineer approve this?

If any answer is "No", improve it before finishing.

---

# UI Workflow

For every page:

Analyze user goals.

Minimize clicks.

Group related actions.

Highlight primary actions.

Hide destructive actions behind confirmation.

Keep visual hierarchy clean.

Avoid clutter.

Prefer whitespace.

Use cards for summaries.

Use tables for large data.

Use dialogs instead of new pages where appropriate.

Maintain consistency across the application.

---

# Database Workflow

Before adding tables:

Check if an existing table can be extended.

Avoid duplicate entities.

Normalize data.

Design for future modules.

Think about reporting requirements.

Think about analytics.

Think about audit logs.

Think about soft delete if applicable.

---

# Feature Workflow

For every feature ask:

Who uses it?

Who can edit it?

Who can view it?

What validations are required?

What audit logs are needed?

What notifications are needed?

What reports will depend on this data?

Can this feature scale to multiple schools?

Will future modules integrate with it?

Only after answering these questions should implementation begin.