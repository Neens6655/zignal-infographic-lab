import { readFileSync } from 'fs'
import { resolve } from 'path'
import { StylesFileSchema, LayoutsFileSchema } from '../src/data/schemas'

const dataDir = resolve(__dirname, '../src/data')

function validate(filename: string, schema: typeof StylesFileSchema | typeof LayoutsFileSchema) {
  const raw = readFileSync(resolve(dataDir, filename), 'utf-8')
  const data = JSON.parse(raw)
  const result = schema.safeParse(data)

  if (!result.success) {
    console.error(`\n❌ ${filename} validation failed:\n`)
    for (const issue of result.error.issues) {
      console.error(`  [${issue.path.join('.')}] ${issue.message}`)
    }
    return false
  }

  console.log(`✓ ${filename} — ${data.length} entries valid`)
  return true
}

let allValid = true

allValid = validate('styles.json', StylesFileSchema) && allValid
allValid = validate('layouts.json', LayoutsFileSchema) && allValid

if (!allValid) {
  console.error('\n❌ Data validation failed. Fix errors above before building.')
  process.exit(1)
}

console.log('\n✓ All data files valid.')
