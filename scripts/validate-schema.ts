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
import { generateText } from 'ai'
import { config } from 'dotenv'

// Load environment variables
config()

const OPENRPC_SCHEMA_URL = 'https://github.com/nimiq/core-rs-albatross/releases/download/v1.1.1/openrpc-document.json'
const NIMIQ_TEST_URL = process.env.NIMIQ_TEST_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const FORCE_VALIDATION = process.env.FORCE_VALIDATION === 'true'

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
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

async function downloadSchema(): Promise<any> {
  console.log('📥 Downloading OpenRPC schema...')
  const response = await fetch(OPENRPC_SCHEMA_URL)

  if (!response.ok) {
    throw new Error(`Failed to download schema: ${response.status} ${response.statusText}`)
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

async function testHttpMethods(schema: any): Promise<HttpTestResult> {
  console.log('🌐 Testing HTTP methods against live node...')

  const failures: string[] = []
  let methodsTested = 0

  // Extract methods from OpenRPC schema
  const methods = schema.methods || []
  const testMethods = methods.slice(0, 5) // Test first 5 methods as examples

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

      const response = await fetch(NIMIQ_TEST_URL, {
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

async function validateWithAI(schema: any, implementation: string): Promise<ValidationResult> {
  console.log('🤖 Validating with GPT-5...')

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  const prompt = `You are a TypeScript code validator. Compare this OpenRPC JSON schema with the TypeScript implementation and validate that:

1. All RPC methods defined in the schema are implemented
2. Method signatures match (parameters, return types)
3. Parameter names and types are correct
4. Return types match the schema definitions
5. No methods are missing or incorrectly implemented

OpenRPC Schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

TypeScript Implementation:
\`\`\`typescript
${implementation}
\`\`\`

Please provide a detailed analysis in JSON format with:
- success: boolean (true if all methods are correctly implemented)
- errors: array of critical issues that must be fixed
- warnings: array of non-critical issues or improvements
- summary: brief overview of the validation results

Be thorough and check every method, parameter, and type definition.`

  try {
    const { text } = await generateText({
      model: openai('gpt-5', {
        apiKey: OPENAI_API_KEY,
      }),
      prompt,
      maxTokens: 4000,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/(\{[\s\S]*?\})/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response')
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0])
  }
  catch (error) {
    console.error('AI validation failed:', error)
    return {
      success: false,
      errors: [`AI validation failed: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
      summary: 'AI validation could not be completed due to an error',
    }
  }
}

async function createGitHubIssues(result: ValidationResult): Promise<string[]> {
  const isDev = process.env.NODE_ENV === 'development' || !GITHUB_TOKEN
  const issues: GitHubIssue[] = []
  const createdIssues: string[] = []

  // Create issues for errors
  for (const error of result.errors) {
    issues.push({
      title: `Schema Validation Error: ${error.substring(0, 60)}${error.length > 60 ? '...' : ''}`,
      body: `## Validation Error\n\n${error}\n\n**Context:** ${result.summary}\n\n---\n*This issue was created automatically by the schema validation script.*`,
      labels: ['bug', 'schema-validation', 'ai-detected'],
    })
  }

  // Create issues for warnings (as enhancement requests)
  for (const warning of result.warnings) {
    issues.push({
      title: `Schema Validation Warning: ${warning.substring(0, 60)}${warning.length > 60 ? '...' : ''}`,
      body: `## Validation Warning\n\n${warning}\n\n**Context:** ${result.summary}\n\n---\n*This issue was created automatically by the schema validation script.*`,
      labels: ['enhancement', 'schema-validation', 'ai-detected'],
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

    const [schema, implementation] = await Promise.all([
      downloadSchema(),
      readCurrentImplementation(),
    ])

    const result = await validateWithAI(schema, implementation)

    console.log('\n📊 Validation Results:')
    console.log(`Success: ${result.success}`)
    console.log(`Summary: ${result.summary}`)

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(error => console.log(`  - ${typeof error === 'string' ? error : JSON.stringify(error, null, 2)}`))
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`  - ${typeof warning === 'string' ? warning : JSON.stringify(warning, null, 2)}`))
    }

    // Test HTTP methods against live node if URL is provided
    let httpTestResult: HttpTestResult | null = null
    if (NIMIQ_TEST_URL) {
      httpTestResult = await testHttpMethods(schema)
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
    const allErrors = httpTestResult
      ? [...result.errors, ...httpTestResult.failures.map(f => `HTTP Test Failure: ${f}`)]
      : result.errors

    const combinedResult = {
      ...result,
      errors: allErrors,
      summary: httpTestResult
        ? `${result.summary}. HTTP Tests: ${httpTestResult.summary}`
        : result.summary,
      success: httpTestResult ? result.success && httpTestResult.success : result.success,
    }

    const createdIssues = await createGitHubIssues(combinedResult)

    // Send summary notification to Slack
    await sendSlackNotification(combinedResult, createdIssues)

    process.exit(result.success ? 0 : 1)
  }
  catch (error) {
    console.error('💥 Script failed:', error)

    const failureResult: ValidationResult = {
      success: false,
      errors: [`Script execution failed: ${error instanceof Error ? error.message : String(error)}`],
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
