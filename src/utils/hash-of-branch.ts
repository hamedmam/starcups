import { createHash } from 'crypto'
import { execSync } from 'child_process'

export const hashOfBranch = (length = 7): string => {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  return createHash('md5').update(branch).digest('hex').slice(0, length)
}
