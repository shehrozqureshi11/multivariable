# Prisma migrate against Supabase
#
# 1. Set DATABASE_URL (pooler) and DIRECT_URL (direct) in root .env
# 2. From repo root:
#      npm run db:generate
#      npm run db:push    # quick sync for MVP
#    or:
#      npm run db:migrate # creates migration history
# 3. Seed demo data:
#      npm run db:seed
#
# Supabase SQL editor alternative: run `prisma migrate diff` output if needed.

