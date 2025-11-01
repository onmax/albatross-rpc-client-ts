#!/usr/bin/env tsx
/**
 * Schema Validation Script
 *
 * This script validates the TypeScript implementation against the OpenRPC schema
 * using GPT-5 for analysis and creates GitHub issues for problems found.
 * It can also test HTTP methods against a live Nimiq node.
 *
 * Environment Variables:
 * - OPENAI_API_KEY: Required for AI validation
 * - SLACK_WEBHOOK_URL: Optional, for summary notifications
 * - GITHUB_TOKEN: Required for creating issues (automatically available in GitHub Actions)
 * - NODE_ENV: When set to 'development', mocks GitHub issue creation
 * - FORCE_VALIDATION: Set to 'true' to run validation even without changes
 * - NIMIQ_TEST_URL: URL for testing HTTP methods against live Nimiq node
 *
 * Usage:
 * - Production: pnpm validate-schema
 * - Development: NODE_ENV=development pnpm validate-schema
 * - Force run: FORCE_VALIDATION=true pnpm validate-schema
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import process from 'node:process'
import { openai } from '@ai-sdk/openai'
import { valibotSchema } from '@ai-sdk/valibot'
import { generateObject } from 'ai'
import { config } from 'dotenv'
import { diff } from 'just-diff'
import * as v from 'valibot'

// Load environment variables
config()

const NIMIQ_TEST_URL = process.env.NIMIQ_TEST_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const FORCE_VALIDATION = process.env.FORCE_VALIDATION === 'true'
const SKIP_DIFF_VALIDATION = process.env.SKIP_DIFF_VALIDATION === 'true'
const REPO_OWNER = 'nimiq'
const REPO_NAME = 'core-rs-albatross'
const VERSION_FILE = '.last-validated-version'

interface ValidationIssue {
  functionName: string
  issue: string
  solution: string
}

interface ValidationResult {
  success: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  summary: string
}

interface GitHubIssue {
  title: string
  body: string
  labels: string[]
}

interface HttpTestResult {
  success: boolean
  methodsTested: number
  failures: string[]
  summary: string
}

interface ReleaseInfo {
  version: string
  changelog: string
  publishedAt: string
}

interface MethodInfo {
  name: string
  params?: any[]
  result?: any
  changeDescription?: string
}

interface SchemaDiff {
  added: MethodInfo[]
  modified: MethodInfo[]
  removed: string[]
}

interface ValidationContext {
  latestVersion: string
  previousVersion: string
  changelog: string
  schemaDiff: SchemaDiff | null
  implementation: string
}

async function shouldRunValidation(): Promise<boolean> {
  if (FORCE_VALIDATION) {
    console.log('🔄 Force validation enabled')
    return true
  }

  // Check if running in GitHub Actions
  if (!process.env.GITHUB_ACTIONS) {
    console.log('📍 Running locally - validation enabled')
    return true
  }

  // In GitHub Actions, only run on manual trigger or specific conditions
  const eventName = process.env.GITHUB_EVENT_NAME
  console.log(`📋 GitHub event: ${eventName}`)

  // Run on workflow_dispatch (manual trigger) or on main branch pushes
  return eventName === 'workflow_dispatch'
    || (eventName === 'push' && process.env.GITHUB_REF === 'refs/heads/main')
}

async function fetchLatestRelease(): Promise<ReleaseInfo> {
  console.log('📡 Fetching latest release from ungh...')
  const unghUrl = `https://ungh.cc/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`

  try {
    const response = await fetch(unghUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch release from ungh: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const release = data.release || data

    return {
      version: release.tag || release.tag_name || '',
      changelog: release.markdown || release.body || '',
      publishedAt: release.publishedAt || release.published_at || release.createdAt || release.created_at || '',
    }
  }
  catch {
    console.error('Failed to fetch from ungh, retrying once...')
    // Retry once
    const response = await fetch(unghUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch release from ungh after retry: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const release = data.release || data
    return {
      version: release.tag || release.tag_name || '',
      changelog: release.markdown || release.body || '',
      publishedAt: release.publishedAt || release.published_at || release.createdAt || release.created_at || '',
    }
  }
}

async function getLastValidatedVersion(): Promise<string> {
  try {
    const content = await fs.readFile(VERSION_FILE, 'utf-8')
    return content.trim()
  }
  catch {
    // File doesn't exist, return default
    console.log('📝 No previous validation version found, using default v1.1.1')
    return 'v1.1.1'
  }
}

async function updateLastValidatedVersion(version: string): Promise<void> {
  await fs.writeFile(VERSION_FILE, version, 'utf-8')
  console.log(`✅ Updated last validated version to ${version}`)
}

async function downloadSchemaForVersion(version: string): Promise<any> {
  console.log(`📥 Downloading OpenRPC schema for ${version}...`)
  const url = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${version}/openrpc-document.json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download schema for ${version}: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

async function readCurrentImplementation(): Promise<string> {
  console.log('📖 Reading current implementation...')
  const srcDir = path.join(process.cwd(), 'src')
  const files = await fs.readdir(srcDir, { recursive: true })

  let implementation = ''

  for (const file of files) {
    const filePath = path.join(srcDir, file.toString())
    const stat = await fs.stat(filePath)

    if (stat.isFile() && filePath.endsWith('.ts')) {
      const content = await fs.readFile(filePath, 'utf-8')
      implementation += `\n// File: ${file}\n${content}\n`
    }
  }

  return implementation
}

function compareSchemas(oldSchema: any, newSchema: any): SchemaDiff {
  console.log('🔍 Comparing schemas to detect changes...')

  const oldMethods = new Map<string, any>()
  const newMethods = new Map<string, any>()

  // Build maps of methods
  for (const method of oldSchema.methods || []) {
    oldMethods.set(method.name, method)
  }

  for (const method of newSchema.methods || []) {
    newMethods.set(method.name, method)
  }

  const added: MethodInfo[] = []
  const modified: MethodInfo[] = []
  const removed: string[] = []

  // Find added and modified methods
  for (const [name, newMethod] of newMethods) {
    if (!oldMethods.has(name)) {
      added.push({
        name,
        params: newMethod.params,
        result: newMethod.result,
      })
    }
    else {
      const oldMethod = oldMethods.get(name)
      const methodSignature = { params: oldMethod.params, result: oldMethod.result }
      const newSignature = { params: newMethod.params, result: newMethod.result }
      const changes = diff(methodSignature, newSignature)

      if (changes.length > 0) {
        modified.push({
          name,
          params: newMethod.params,
          result: newMethod.result,
          changeDescription: 'Method signature changed',
        })
      }
    }
  }

  // Find removed methods
  for (const [name] of oldMethods) {
    if (!newMethods.has(name)) {
      removed.push(name)
    }
  }

  console.log(`  📊 Changes: ${added.length} added, ${modified.length} modified, ${removed.length} removed`)

  return { added, modified, removed }
}

async function testHttpMethods(schema: any): Promise<HttpTestResult> {
  console.log('🌐 Testing HTTP methods against live node...')

  const failures: string[] = []
  let methodsTested = 0

  // Extract methods from OpenRPC schema
  const methods = schema.methods || []
  // Filter to READ operations and test more comprehensively
  const readMethods = methods.filter((method: any) =>
    method.name && (
      method.name.startsWith('get')
      || method.name.startsWith('is')
      || method.name.startsWith('list')
      || method.name.includes('mempool')
      || method.name === 'getPeerCount'
      || method.name === 'getPeerId'
      || method.name === 'getPeerList'
    ),
  )
  const testMethods = readMethods.slice(0, 15) // Test up to 15 read methods

  for (const method of testMethods) {
    methodsTested++
    const methodName = method.name

    try {
      console.log(`  Testing ${methodName}...`)

      // Create a basic test payload
      const payload = {
        jsonrpc: '2.0',
        method: methodName,
        params: method.params?.length > 0 ? getTestParams(method.params) : [],
        id: 1,
      }

      const response = await fetch(NIMIQ_TEST_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        failures.push(`${methodName}: HTTP ${response.status} ${response.statusText}`)
        continue
      }

      const result = await response.json()

      if (result.error) {
        // Some errors are expected (like missing parameters), only report serious ones
        if (result.error.code === -32601) { // Method not found
          failures.push(`${methodName}: Method not found on server`)
        }
        else if (result.error.code === -32700) { // Parse error
          failures.push(`${methodName}: JSON parse error`)
        }
        // Skip parameter errors (-32602) as they're expected with test data
      }
      else {
        console.log(`  ✅ ${methodName}: Success`)
      }
    }
    catch (error) {
      failures.push(`${methodName}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return {
    success: failures.length === 0,
    methodsTested,
    failures,
    summary: `Tested ${methodsTested} HTTP methods, ${failures.length} failures`,
  }
}

function getTestParams(params: any[]): any[] {
  return params.map((param) => {
    switch (param.schema?.type) {
      case 'string':
        return param.name.includes('address') ? 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000' : 'test'
      case 'number':
      case 'integer':
        return param.name.includes('block') ? 1 : 123
      case 'boolean':
        return false
      default:
        return null
    }
  })
}

// Define the schema for validation issues using Valibot
const ValidationIssueSchema = v.object({
  functionName: v.pipe(v.string(), v.description('Name of the RPC method with issues')),
  issue: v.pipe(v.string(), v.description('Description of the issue')),
  solution: v.pipe(v.string(), v.description('Suggested solution or improvement')),
})

const validationSchema = v.object({
  success: v.pipe(v.boolean(), v.description('True if all methods are correctly implemented')),
  errors: v.pipe(v.array(ValidationIssueSchema), v.description('Array of critical issues that must be fixed')),
  warnings: v.pipe(v.array(ValidationIssueSchema), v.description('Array of non-critical issues or improvements')),
  summary: v.pipe(v.string(), v.description('Brief overview of the validation results')),
})

async function validateWithAI(schema: any, implementation: string): Promise<ValidationResult> {
  console.log('🤖 Validating with GPT-5...')

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-5'),
      prompt: `You are a TypeScript code validator. Compare this OpenRPC JSON schema with the TypeScript implementation and validate that:

1. All RPC methods defined in the schema are implemented
2. Method signatures match (parameters, return types)
3. Parameter names and types are correct
4. Return types match the schema definitions
5. No methods are missing or incorrectly implemented

IMPORTANT: This TypeScript client is designed with developer experience (DX) in mind. Features like:
- Conditional return types based on parameters (e.g., T extends boolean ? Block : PartialBlock)
- Type inference shortcuts and generic type patterns
- Smart defaults that improve usability
These are INTENTIONAL design decisions that make development easier, NOT bugs or issues to be fixed. Focus only on actual schema mismatches or missing functionality, not on DX enhancements that deviate from a literal schema translation.

INTENTIONAL TYPE TRANSFORMATIONS FOR DX: The following type differences between the schema and implementation are INTENTIONAL and should NOT be reported:
- Byte arrays (number[]) are transformed to hex strings (string) for easier use (e.g., Block.extraData, Transaction.senderData, Transaction.recipientData, Transaction.proof)
- Numeric enums are transformed to string enums or union types for type safety (e.g., Block.network)
- Any field that represents binary data (hashes, signatures, proofs, raw data) is represented as hex strings instead of byte arrays
These transformations improve developer experience and should be considered correct, not errors.

IGNORE VALIDATION SCHEMA MAPPING: Do NOT report issues about the validation.ts file's getSchemaForMethod mapping. This is an internal optional validation helper that may have minor discrepancies (e.g., Transaction vs ExecutedTransaction, PenalizedSlots vs PenalizedSlots[]). Validation is disabled by default and these mapping differences do not affect functionality. Only report issues if actual RPC method implementations are wrong, not the internal validation mapping.

OPTIONAL PARAMETERS FOR DX: The following methods intentionally allow optional parameters even if the schema marks them as required, for better developer experience (the server handles defaults when null is sent):
- getTransactionsByAddress: max and startAt are optional
- getTransactionHashesByAddress: max and startAt are optional
Do NOT report these as issues - they are intentional DX improvements where the client sends null and the server provides sensible defaults.

VALIDITY START HEIGHT STRING FORMAT: The validityStartHeight parameter in all transaction creation/sending methods is intentionally sent as a STRING (e.g., "+10" for relative, "100" for absolute), even though the schema defines it as number. The Rust server's ValidityStartHeight deserializer accepts both strings and numbers, with strings supporting the "+N" relative syntax. This is the intended API design and is CORRECT. Do NOT report this as an issue. Affected methods: all createBasicTransaction, sendBasicTransaction, and similar transaction methods.

RPCDATA ENVELOPE WRAPPER: ALL RPC method results are wrapped in RPCData { data, metadata } by the Rust server. The TypeScript client correctly extracts json.result.data. The OpenRPC schema incorrectly documents results as raw values instead of the RPCData envelope. The client implementation (extracting .data) is CORRECT. Do NOT report this as an issue.

IGNORE HTTP TEST FAILURES: Do not report issues for HTTP test failures on methods like 'getAddress' and 'getAccounts' as these are server-side configuration issues, not client implementation problems. Only report actual schema/implementation mismatches in the TypeScript code.

OpenRPC Schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

TypeScript Implementation:
\`\`\`typescript
${implementation}
\`\`\`

Be thorough and check every method, parameter, and type definition. For each issue found, specify the exact function name, the problem, and a clear solution.`,
      schema: valibotSchema(validationSchema),
    })

    return object
  }
  catch (error) {
    console.error('AI validation failed:', error)
    return {
      success: false,
      errors: [{
        functionName: 'AI_VALIDATION_ERROR',
        issue: `AI validation failed: ${error instanceof Error ? error.message : String(error)}`,
        solution: 'Check OpenAI API key and connectivity, or try running validation again',
      }],
      warnings: [],
      summary: 'AI validation could not be completed due to an error',
    }
  }
}

async function validateWithContext(context: ValidationContext, schema: any): Promise<ValidationResult> {
  console.log('🤖 Validating with GPT-5 (context-aware)...')

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  const { latestVersion, previousVersion, changelog, schemaDiff, implementation } = context

  // Build priority section for prompt
  let prioritySection = ''
  if (schemaDiff && (schemaDiff.added.length > 0 || schemaDiff.modified.length > 0 || schemaDiff.removed.length > 0)) {
    prioritySection = `
PRIORITY VALIDATION (Recent Changes ${previousVersion} → ${latestVersion}):

**HIGH PRIORITY** - Validate these changes first:

Added Methods (${schemaDiff.added.length}):
${schemaDiff.added.map(m => `- ${m.name}`).join('\n')}

Modified Methods (${schemaDiff.modified.length}):
${schemaDiff.modified.map(m => `- ${m.name} (signature changed)`).join('\n')}

Removed Methods (${schemaDiff.removed.length}):
${schemaDiff.removed.map(m => `- ${m} (should be removed from implementation)`).join('\n')}

Changelog Context:
\`\`\`
${changelog.substring(0, 2000)}${changelog.length > 2000 ? '...' : ''}
\`\`\`

Focus validation efforts on these recent changes, but still perform a global check for other issues.
`
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-5'),
      prompt: `You are a TypeScript code validator. Compare this OpenRPC JSON schema with the TypeScript implementation and validate that:

1. All RPC methods defined in the schema are implemented
2. Method signatures match (parameters, return types)
3. Parameter names and types are correct
4. Return types match the schema definitions
5. No methods are missing or incorrectly implemented

${prioritySection}

IMPORTANT: This TypeScript client is designed with developer experience (DX) in mind. Features like:
- Conditional return types based on parameters (e.g., T extends boolean ? Block : PartialBlock)
- Type inference shortcuts and generic type patterns
- Smart defaults that improve usability
These are INTENTIONAL design decisions that make development easier, NOT bugs or issues to be fixed. Focus only on actual schema mismatches or missing functionality, not on DX enhancements that deviate from a literal schema translation.

INTENTIONAL TYPE TRANSFORMATIONS FOR DX: The following type differences between the schema and implementation are INTENTIONAL and should NOT be reported:
- Byte arrays (number[]) are transformed to hex strings (string) for easier use (e.g., Block.extraData, Transaction.senderData, Transaction.recipientData, Transaction.proof)
- Numeric enums are transformed to string enums or union types for type safety (e.g., Block.network)
- Any field that represents binary data (hashes, signatures, proofs, raw data) is represented as hex strings instead of byte arrays
These transformations improve developer experience and should be considered correct, not errors.

IGNORE VALIDATION SCHEMA MAPPING: Do NOT report issues about the validation.ts file's getSchemaForMethod mapping. This is an internal optional validation helper that may have minor discrepancies (e.g., Transaction vs ExecutedTransaction, PenalizedSlots vs PenalizedSlots[]). Validation is disabled by default and these mapping differences do not affect functionality. Only report issues if actual RPC method implementations are wrong, not the internal validation mapping.

OPTIONAL PARAMETERS FOR DX: The following methods intentionally allow optional parameters even if the schema marks them as required, for better developer experience (the server handles defaults when null is sent):
- getTransactionsByAddress: max and startAt are optional
- getTransactionHashesByAddress: max and startAt are optional
Do NOT report these as issues - they are intentional DX improvements where the client sends null and the server provides sensible defaults.

VALIDITY START HEIGHT STRING FORMAT: The validityStartHeight parameter in all transaction creation/sending methods is intentionally sent as a STRING (e.g., "+10" for relative, "100" for absolute), even though the schema defines it as number. The Rust server's ValidityStartHeight deserializer accepts both strings and numbers, with strings supporting the "+N" relative syntax. This is the intended API design and is CORRECT. Do NOT report this as an issue. Affected methods: all createBasicTransaction, sendBasicTransaction, and similar transaction methods.

RPCDATA ENVELOPE WRAPPER: ALL RPC method results are wrapped in RPCData { data, metadata } by the Rust server. The TypeScript client correctly extracts json.result.data. The OpenRPC schema incorrectly documents results as raw values instead of the RPCData envelope. The client implementation (extracting .data) is CORRECT. Do NOT report this as an issue.

IGNORE HTTP TEST FAILURES: Do not report issues for HTTP test failures on methods like 'getAddress' and 'getAccounts' as these are server-side configuration issues, not client implementation problems. Only report actual schema/implementation mismatches in the TypeScript code.

OpenRPC Schema (${latestVersion}):
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

TypeScript Implementation:
\`\`\`typescript
${implementation}
\`\`\`

Be thorough and check every method, parameter, and type definition. For each issue found, specify the exact function name, the problem, and a clear solution.`,
      schema: valibotSchema(validationSchema),
    })

    return object
  }
  catch (error) {
    console.error('AI validation failed:', error)
    return {
      success: false,
      errors: [{
        functionName: 'AI_VALIDATION_ERROR',
        issue: `AI validation failed: ${error instanceof Error ? error.message : String(error)}`,
        solution: 'Check OpenAI API key and connectivity, or try running validation again',
      }],
      warnings: [],
      summary: 'AI validation could not be completed due to an error',
    }
  }
}

async function fetchExistingAIIssues(): Promise<Set<string>> {
  const isDev = process.env.NODE_ENV === 'development' || !GITHUB_TOKEN
  const existingIssues = new Set<string>()

  if (isDev || !GITHUB_TOKEN) {
    console.log('🔧 Development mode or no GitHub token - skipping existing issues check')
    return existingIssues
  }

  try {
    const repoInfo = process.env.GITHUB_REPOSITORY || 'onmax/albatross-rpc-client-ts'
    const response = await fetch(`https://api.github.com/repos/${repoInfo}/issues?labels=ai&state=open&per_page=100`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const issues = await response.json()
      for (const issue of issues) {
        // Extract function name from title format: [functionName] issue...
        const titleMatch = issue.title.match(/^\[([^\]]+)\]/)
        if (titleMatch) {
          existingIssues.add(titleMatch[1])
        }
      }
      console.log(`📋 Found ${existingIssues.size} existing AI-generated issues`)
    }
    else {
      console.warn(`⚠️  Failed to fetch existing issues: ${response.status} ${response.statusText}`)
    }
  }
  catch (error) {
    console.warn('⚠️  Error fetching existing issues:', error)
  }

  return existingIssues
}

async function createGitHubIssues(result: ValidationResult, schemaDiff: SchemaDiff | null = null): Promise<string[]> {
  const isDev = process.env.NODE_ENV === 'development' || !GITHUB_TOKEN
  const issues: GitHubIssue[] = []
  const createdIssues: string[] = []

  // Fetch existing AI-generated issues to avoid duplicates
  const existingIssues = await fetchExistingAIIssues()

  // Build set of recently changed methods for labeling
  const recentChanges = new Set<string>()
  if (schemaDiff) {
    schemaDiff.added.forEach(m => recentChanges.add(m.name))
    schemaDiff.modified.forEach(m => recentChanges.add(m.name))
    schemaDiff.removed.forEach(m => recentChanges.add(m))
  }

  // Create issues for errors (skip if already exists)
  for (const error of result.errors) {
    if (existingIssues.has(error.functionName)) {
      console.log(`⏭️  Skipping duplicate error issue for ${error.functionName}`)
      continue
    }

    const isRecentChange = recentChanges.has(error.functionName)
    const priorityLabel = isRecentChange ? 'recent-change' : 'legacy-issue'

    issues.push({
      title: `[${error.functionName}] ${error.issue.substring(0, 80)}${error.issue.length > 80 ? '...' : ''}`,
      body: `## Schema Validation Error\n\n**Function:** \`${error.functionName}\`\n\n**Issue:**\n${error.issue}\n\n**Suggested Solution:**\n${error.solution}\n\n**Context:** ${result.summary}\n\n---\n*This issue was created automatically by the schema validation script.*`,
      labels: ['bug', 'schema-validation', 'ai-detected', 'ai', priorityLabel],
    })
  }

  // Create issues for warnings (as enhancement requests, skip if already exists)
  for (const warning of result.warnings) {
    if (existingIssues.has(warning.functionName)) {
      console.log(`⏭️  Skipping duplicate warning issue for ${warning.functionName}`)
      continue
    }

    const isRecentChange = recentChanges.has(warning.functionName)
    const priorityLabel = isRecentChange ? 'recent-change' : 'legacy-issue'

    issues.push({
      title: `[${warning.functionName}] ${warning.issue.substring(0, 80)}${warning.issue.length > 80 ? '...' : ''}`,
      body: `## Schema Validation Warning\n\n**Function:** \`${warning.functionName}\`\n\n**Issue:**\n${warning.issue}\n\n**Suggested Improvement:**\n${warning.solution}\n\n**Context:** ${result.summary}\n\n---\n*This issue was created automatically by the schema validation script.*`,
      labels: ['enhancement', 'schema-validation', 'ai-detected', 'ai', priorityLabel],
    })
  }

  if (isDev) {
    console.log('🔧 Development mode - mocking GitHub issue creation:')
    for (const issue of issues) {
      console.log(`📝 Mock Issue: ${issue.title}`)
      console.log(`   Labels: ${issue.labels.join(', ')}`)
      createdIssues.push(`mock-issue-${Math.random().toString(36).substr(2, 9)}`)
    }
    return createdIssues
  }

  if (!GITHUB_TOKEN) {
    console.log('⚠️  No GitHub token provided, skipping issue creation')
    return createdIssues
  }

  const repoInfo = process.env.GITHUB_REPOSITORY || 'onmax/albatross-rpc-client-ts'

  for (const issue of issues) {
    try {
      const response = await fetch(`https://api.github.com/repos/${repoInfo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issue),
      })

      if (response.ok) {
        const createdIssue = await response.json()
        console.log(`✅ Created issue: ${createdIssue.html_url}`)
        createdIssues.push(createdIssue.html_url)
      }
      else {
        console.error(`❌ Failed to create issue: ${response.status} ${response.statusText}`)
      }
    }
    catch (error) {
      console.error('Error creating GitHub issue:', error)
    }
  }

  return createdIssues
}

async function sendSlackNotification(result: ValidationResult, createdIssues: string[], error?: Error): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development' || !SLACK_WEBHOOK_URL

  if (isDev) {
    console.log('🔧 Development mode - mocking Slack notification:')
    console.log('📨 Mock Slack Message:')
    console.log({
      success: result.success,
      summary: result.summary,
      issuesCreated: createdIssues.length,
      issueUrls: createdIssues,
      ...(error && { systemError: error.message }),
    })
    return
  }

  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  No Slack webhook URL provided, skipping notification')
    return
  }

  const color = result.success ? 'good' : 'danger'
  const title = result.success ? '✅ Schema Validation Passed' : '❌ Schema Validation Failed'
  const totalIssues = result.errors.length + result.warnings.length

  const payload = {
    attachments: [{
      color,
      title,
      text: result.summary.length > 500 ? `${result.summary.substring(0, 450)}...` : result.summary,
      fields: [
        ...(totalIssues > 0
          ? [{
              title: `Issues Created (${createdIssues.length})`,
              value: createdIssues.length > 0
                ? createdIssues.map(url => `• ${url}`).join('\n')
                : `${result.errors.length} errors and ${result.warnings.length} warnings detected`,
              short: false,
            }]
          : [{
              title: 'Status',
              value: 'No issues found - schema validation passed! ✨',
              short: false,
            }]),
        ...(error
          ? [{
              title: 'System Error',
              value: error.message,
              short: false,
            }]
          : []),
      ],
    }],
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.status, response.statusText)
    }
    else {
      console.log('📨 Slack notification sent')
    }
  }
  catch (error) {
    console.error('Error sending Slack notification:', error)
  }
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting schema validation...')

    // Check if validation should run
    const shouldRun = await shouldRunValidation()
    if (!shouldRun) {
      console.log('⏭️  Skipping validation - no trigger conditions met')
      return
    }

    // Fetch latest release info
    const releaseInfo = await fetchLatestRelease()
    const latestVersion = releaseInfo.version
    console.log(`📦 Latest release: ${latestVersion}`)

    // Get last validated version
    const previousVersion = await getLastValidatedVersion()
    console.log(`📝 Previous validation: ${previousVersion}`)

    // Check if we need to validate (skip if versions match and not forced)
    if (latestVersion === previousVersion && !FORCE_VALIDATION) {
      console.log('✅ Already validated against latest version')
      return
    }

    let schemaDiff: SchemaDiff | null = null
    let latestSchema: any

    if (SKIP_DIFF_VALIDATION) {
      console.log('⏭️  Skipping schema diff (SKIP_DIFF_VALIDATION=true)')
      latestSchema = await downloadSchemaForVersion(latestVersion)
    }
    else {
      // Download both schemas and compare
      try {
        const [previousSchema, newSchema] = await Promise.all([
          downloadSchemaForVersion(previousVersion),
          downloadSchemaForVersion(latestVersion),
        ])

        latestSchema = newSchema
        schemaDiff = compareSchemas(previousSchema, newSchema)
      }
      catch (error) {
        console.warn('⚠️  Could not download previous schema, skipping diff')
        console.warn(`   Error: ${error instanceof Error ? error.message : String(error)}`)
        latestSchema = await downloadSchemaForVersion(latestVersion)
      }
    }

    // Read current implementation
    const implementation = await readCurrentImplementation()

    // Validate with context
    let result: ValidationResult
    if (schemaDiff) {
      const context: ValidationContext = {
        latestVersion,
        previousVersion,
        changelog: releaseInfo.changelog,
        schemaDiff,
        implementation,
      }
      result = await validateWithContext(context, latestSchema)
    }
    else {
      // Fallback to basic validation
      result = await validateWithAI(latestSchema, implementation)
    }

    console.log('\n📊 Validation Results:')
    console.log(`Success: ${result.success}`)
    console.log(`Summary: ${result.summary}`)

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(error => console.log(`  - [${error.functionName}] ${error.issue}`))
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`  - [${warning.functionName}] ${warning.issue}`))
    }

    // Test HTTP methods against live node if URL is provided
    let httpTestResult: HttpTestResult | null = null
    if (NIMIQ_TEST_URL) {
      httpTestResult = await testHttpMethods(latestSchema)
      console.log(`\n🌐 HTTP Test Results: ${httpTestResult.summary}`)

      if (httpTestResult.failures.length > 0) {
        console.log('\n❌ HTTP Test Failures:')
        httpTestResult.failures.forEach(failure => console.log(`  - ${failure}`))
      }
    }
    else {
      console.log('\n⏭️  Skipping HTTP tests - NIMIQ_TEST_URL not provided')
    }

    // Create GitHub issues for problems found (both AI validation and HTTP test failures)
    const httpErrors: ValidationIssue[] = httpTestResult
      ? httpTestResult.failures.map(failure => ({
          functionName: failure.split(':')[0] || 'HTTP_TEST',
          issue: `HTTP Test Failure: ${failure}`,
          solution: 'Check RPC endpoint connectivity, method parameters, or server configuration',
        }))
      : []

    const combinedResult: ValidationResult = {
      ...result,
      errors: [...result.errors, ...httpErrors],
      summary: httpTestResult
        ? `${result.summary}. HTTP Tests: ${httpTestResult.summary}`
        : result.summary,
      success: httpTestResult ? result.success && httpTestResult.success : result.success,
    }

    const createdIssues = await createGitHubIssues(combinedResult, schemaDiff)

    // Send summary notification to Slack
    await sendSlackNotification(combinedResult, createdIssues)

    // Update last validated version on success
    if (result.success) {
      await updateLastValidatedVersion(latestVersion)
    }

    process.exit(result.success ? 0 : 1)
  }
  catch (error) {
    console.error('💥 Script failed:', error)

    const failureResult: ValidationResult = {
      success: false,
      errors: [{
        functionName: 'SCRIPT_ERROR',
        issue: `Script execution failed: ${error instanceof Error ? error.message : String(error)}`,
        solution: 'Check script dependencies, environment variables, and try running again',
      }],
      warnings: [],
      summary: 'Schema validation script encountered a fatal error',
    }

    const createdIssues = await createGitHubIssues(failureResult)
    await sendSlackNotification(failureResult, createdIssues, error instanceof Error ? error : new Error(String(error)))
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
