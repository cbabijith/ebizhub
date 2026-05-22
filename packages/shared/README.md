# Shared Package

Shared types and utilities for EzhavaClub applications.

## Usage

```typescript
import { User, formatDate } from 'shared';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
  created_at: new Date().toISOString(),
};

console.log(formatDate(user.created_at));
```
