// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
      updated_at: string
      session_id?: string
    }

    meals: {
      id: string
      name: string
      description: string
      date: string
      is_diet: boolean
      user_id: string
      created_at: string
      updated_at: string
      session_id?: string
    }
  }
}
