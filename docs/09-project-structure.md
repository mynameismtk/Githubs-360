# Clinic 360 — Project Structure

```
clinic-360/
├── docs/                          architecture (this folder)
├── prisma/
│   ├── schema.prisma              the data model
│   ├── migrations/                versioned SQL
│   └── seed.ts                    realistic fictional demo data
├── src/
│   ├── app/
│   │   ├── (marketing)/           entry + onboarding + login
│   │   ├── app/                   PATIENT surface — mobile-first shell
│   │   ├── console/               CLINICAL surface — doctor / nurse / lab / pharmacy
│   │   ├── ops/                   OPERATIONS surface — reception / admin
│   │   └── api/                   route handlers (thin: parse → authz → service)
│   ├── components/
│   │   ├── ui/                    design-system primitives
│   │   └── patterns/              composed, product-specific components
│   ├── server/
│   │   ├── db.ts                  Prisma singleton + driver adapter
│   │   ├── auth/                  session, OTP, policy (the authorization layer)
│   │   ├── services/              ALL business logic and data access
│   │   ├── integrations/          external-service interfaces + dev adapters
│   │   └── audit.ts               append-only audit writer
│   ├── lib/                       pure helpers — format, date, money, errors, i18n
│   └── i18n/                      typed message catalogue
└── .env.example                   every variable, no values
```

## The layering rule

```
route handler / server component
        ↓  (never skips)
    service            ← authorization happens here or above, never below
        ↓
     Prisma
```

A route handler that imports `db` directly is a bug. This is the invariant that keeps the
patient-scope check from being forgotten on the one endpoint that matters.

## Naming

- Components `PascalCase.tsx`; everything else `kebab-case.ts`.
- Services are named for the domain noun: `appointments.ts`, `patients.ts`.
- Anything requiring a real vendor before production is marked `INTEGRATION POINT` in a
  comment, so `grep -rn "INTEGRATION POINT" src/` lists exactly what is not yet real.
