import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'child_process'

import { app } from '../src/app'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it.skip('should be able to create a User', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
      })
      .expect(201)
  })

  it('should be able to check user Metrics', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')

    const randomNumber = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

    const meals = Array.from(
      { length: randomNumber(1, 10) },
      () => Math.random() > 0.5,
    )

    const beatStreak = Math.max(
      ...meals.reduce(
        (acc, meal) => {
          if (meal) {
            return [acc[0], acc[1] + 1]
          }

          return [Math.max(acc[0], acc[1]), 0]
        },
        [0, 0],
      ),
    )

    const requests = meals.map((isDiet, index) => {
      const date = new Date()
      date.setDate(date.getDate() + index)

      return request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: `Test Meal ${index + 1}`,
          description: 'This is a test meal',
          date,
          isDiet,
        })
    })

    await request(app.server).post('/meals').send({
      name: 'Not in session',
      description: 'This is a test meal',
      date: new Date(),
      isDiet: true,
    })

    await Promise.all(requests)

    const userMetricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(userMetricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: meals.length,
        onDietMeals: meals.filter(Boolean).length,
        outOfDietMeals: meals.filter((isDiet) => !isDiet).length,
        bestStreak: beatStreak,
      }),
    )
  })
})
