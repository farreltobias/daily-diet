import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'child_process'

import { app } from '../src/app'

describe('Meals Routes', () => {
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

  it('should not be able to create a Meal without User', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Test Meal',
        description: 'This is a test meal',
        date: new Date(),
        isDiet: true,
      })
      .expect(401)
  })

  it('should be able to create a Meal', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Test Meal',
        description: 'This is a test meal',
        date: new Date(),
        isDiet: true,
      })
      .expect(201)
  })

  it('should be able to update a Meal', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Test Meal',
      description: 'This is a test meal',
      date: new Date(),
      isDiet: true,
    })

    const mealListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const { id } = mealListResponse.body.meals[0]
    const date = new Date('2024-02-22T12:00:00Z')

    await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', cookies)
      .send({
        name: 'Test Meal Updated',
        description: 'This is a test meal updated',
        date,
        isDiet: false,
      })
      .expect(201)

    const mealGetResponse = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies)

    expect(mealGetResponse.body).toEqual(
      expect.objectContaining({
        meal: {
          id,
          name: 'Test Meal Updated',
          description: 'This is a test meal updated',
          date: date.toISOString(),
          is_diet: 0,
        },
      }),
    )
  })

  it('should be able to delete a Meal', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Test Meal',
      description: 'This is a test meal',
      date: new Date(),
      isDiet: true,
    })

    const mealListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const { id } = mealListResponse.body.meals[0]

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to list all Meals', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')
    const date = new Date()

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Test Meal',
      description: 'This is a test meal',
      date,
      isDiet: true,
    })

    const mealListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(mealListResponse.body).toEqual(
      expect.objectContaining({
        meals: expect.arrayContaining([
          {
            id: expect.any(String),
            name: 'Test Meal',
            description: 'This is a test meal',
            date: date.toISOString(),
            is_diet: 1,
          },
        ]),
      }),
    )
  })

  it('should be able to get a specific Meal', async () => {
    const userCreateResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
    })

    const cookies = userCreateResponse.get('Set-Cookie')
    const date = new Date()

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Test Meal',
      description: 'This is a test meal',
      date,
      isDiet: true,
    })

    const mealListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const { id } = mealListResponse.body.meals[0]

    const mealGetResponse = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealGetResponse.body).toEqual(
      expect.objectContaining({
        meal: {
          id,
          name: 'Test Meal',
          description: 'This is a test meal',
          date: date.toISOString(),
          is_diet: 1,
        },
      }),
    )
  })
})
