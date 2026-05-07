# Advanced Features

Architect.io supports complex backend patterns through specialized nodes.

## Auth Node
- Implements JWT-based authentication.
- Supports 6-digit OTP verification.
- Generates `auth.js` middleware.

## Storage Node
- Handles file uploads.
- Configurable for AWS S3 or Local storage.
- Auto-generates upload middleware.

## Cron Node
- Schedules background tasks.
- Uses standard cron syntax (e.g., `0 0 * * *`).
- Triggers logic hooks or services.

## Webhook Node
- External event integration (Stripe, GitHub).
- Generates dedicated webhook endpoints.
- Secure request validation.
