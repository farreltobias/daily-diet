import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export const usersRoutes = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const metrics = await knex('meals')
        .select('is_diet')
        .count('is_diet', { as: 'count' })
        .where({ session_id: sessionId })
        .groupBy('is_diet')
        .orderBy('is_diet', 'desc')

      const { onDietMeals, outOfDietMeals } = metrics.reduce(
        (acc, { is_diet: isDiet, count }) => {
          if (isDiet) {
            acc.onDietMeals = Number(count)
          } else {
            acc.outOfDietMeals = Number(count)
          }

          return acc
        },
        { onDietMeals: 0, outOfDietMeals: 0 },
      )

      const rowDiets = knex('meals')
        .rowNumber('rn', 'date')
        .select('is_diet')
        .where({ session_id: sessionId })
        .as('rowDiets')

      const groups = knex('meals')
        .select(knex.raw('rn - ROW_NUMBER() OVER(ORDER BY rn) AS grp'))
        .where({ is_diet: true })
        .from(rowDiets)

      const result = await knex
        .with('groups', groups)
        .max('streak', { as: 'best_streak' })
        .from(knex.count('grp', { as: 'streak' }).from('groups').groupBy('grp'))
        .first()

      return reply.send({
        bestStreak: result?.best_streak || 0,
        onDietMeals,
        outOfDietMeals,
        totalMeals: onDietMeals + outOfDietMeals,
      })
    },
  )
}
