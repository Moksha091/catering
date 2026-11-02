# Project Instructions

- Read the root README and relevant docs before making changes.
- Follow the product and architecture requirements in this repository.
- Use TypeScript strict mode. Avoid `any`; explain unavoidable exceptions.
- Keep components small and feature-oriented.
- Put business logic in server-side services, not React components.
- Validate all external input with Zod on the server.
- Enforce business membership and tenant scope on every private operation.
- Maintain PostgreSQL RLS policies for all tenant-owned tables.
- Never expose service-role keys or payment secrets to the client.
- Use integer paise for INR calculations.
- Never trust client-provided totals, roles, ownership, or booking status.
- Preserve sent quote versions and accepted booking snapshots.
- Use accessible, responsive UI patterns.
- Include loading, empty, success, and error states.
- Add tests for new business logic and authorization-sensitive changes.
- Run lint, typecheck, and relevant tests before finishing.
- Update docs and migrations when architecture or schema changes.
- Do not add dependencies unless they solve a real requirement.
- Do not implement out-of-scope features without explicit approval.

