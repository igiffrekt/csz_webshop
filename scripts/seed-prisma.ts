/**
 * Seed script: Insert sample coupons into Prisma database
 *
 * Usage: npx tsx scripts/seed-prisma.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load env
config({ path: resolve(__dirname, '../apps/web/.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Prisma database...\n')

  // Upsert sample coupons
  const coupon1 = await prisma.coupon.upsert({
    where: { code: 'TESZT10' },
    update: {},
    create: {
      code: 'TESZT10',
      description: '10% kedvezmeny, teszteles celjabol',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderAmount: 0,
      isActive: true,
    },
  })
  console.log(`  Created coupon: ${coupon1.code} (${coupon1.discountValue}% off)`)

  const coupon2 = await prisma.coupon.upsert({
    where: { code: 'TESZT5000' },
    update: {},
    create: {
      code: 'TESZT5000',
      description: '5000 Ft kedvezmeny 20000 Ft felett, teszteles celjabol',
      discountType: 'fixed',
      discountValue: 5000,
      minimumOrderAmount: 20000,
      isActive: true,
    },
  })
  console.log(`  Created coupon: ${coupon2.code} (${coupon2.discountValue} Ft off, min ${coupon2.minimumOrderAmount} Ft)`)

  console.log('\nSeeding complete!')
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
