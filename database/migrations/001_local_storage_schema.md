# Migration 001: Local Browser Storage Schema

The MVP uses `localStorage` key `alliedErpState`.

Required top-level collections:

- `users`
- `customers`
- `products`
- `orders`
- `settings`

Automatic startup migration behavior:

- Adds missing seed users.
- Forces the `admin` user to `super_admin`.
- Adds missing order status fields.
- Adds missing order status history.
- Adds missing credit hold notes.
- Adds per-user hidden order lists.

Hosted production should replace this browser migration with server-side database migrations.
