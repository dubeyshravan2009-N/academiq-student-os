/*
# Add address column to schools

1. Modified Tables
- `schools`: adds `address` (text, nullable) for the school's physical address.
2. Security
- No policy changes. Existing RLS policies already cover the new column.
*/

ALTER TABLE schools ADD COLUMN IF NOT EXISTS address text;
