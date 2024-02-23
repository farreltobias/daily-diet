import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        isDiet: z.boolean(),
      })

      const { name, description, date, isDiet } = createMealBodySchema.parse(
        request.body,
      )

      const user = await knex('users')
        .select('id')
        .where({ session_id: sessionId })
        .first()

      if (!user || !user.id) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date,
        is_diet: isDiet,
        user_id: user.id,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const updateMealParamsSchema = z.object({
        id: z.string(),
      })

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        isDiet: z.boolean().optional(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)
      const { name, description, date, isDiet } = updateMealBodySchema.parse(
        request.body,
      )

      await knex('meals').where({ id, session_id: sessionId }).update({
        name,
        description,
        date,
        is_diet: isDiet,
      })

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const deleteMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)
      await knex('meals').where({ id, session_id: sessionId }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .select('id', 'name', 'description', 'date', 'is_diet')
        .where({ session_id: sessionId })

      return reply.status(200).send({ meals })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals')
        .select('id', 'name', 'description', 'date', 'is_diet')
        .where({ id, session_id: sessionId })
        .first()

      return reply.status(200).send({ meal })
    },
  )
}
