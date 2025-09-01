const { pgTable, text, integer, timestamp, uuid } = require('drizzle-orm/pg-core');

const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  first_choice: integer('first_choice').notNull(),
  second_choice: integer('second_choice').notNull(),
  third_choice: integer('third_choice').notNull(),
  comments: text('comments'),
  submitted_at: timestamp('submitted_at').notNull().defaultNow(),
});

module.exports = { votes };