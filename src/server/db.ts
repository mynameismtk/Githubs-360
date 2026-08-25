import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Prisma singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new connection
 * pool on every edit until Postgres refuses connections. Stashing the client on
 * globalThis is the standard mitigation.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // Fail loudly at boot rather than at the first query, which would surface as a
    // mysterious 500 on a patient screen.
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const db: PrismaClient = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
