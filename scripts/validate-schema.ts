#!/usr/bin/env tsx
/**
 * Schema Validation Script
 * 
 * This script validates the TypeScript implementation against the OpenRPC schema
 * using GPT-5 for analysis and sends results to Slack.
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: Required for AI validation
 * - SLACK_WEBHOOK_URL: Optional, for Slack notifications
 * - NODE_ENV: When set to 'development', mocks Slack notifications
 * 
 * Usage:
 * - Production: pnpm validate-schema
 * - Development: NODE_ENV=development pnpm validate-schema
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { config } from 'dotenv'

// Load environment variables
config()

const OPENRPC_SCHEMA_URL = 'https://github.com/nimiq/core-rs-albatross/releases/download/v1.1.1/openrpc-document.json'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  summary: string
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
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response')
    }

    return JSON.parse(jsonMatch[0].replace(/```json\s*|\s*```/g, ''))
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

async function sendSlackNotification(result: ValidationResult, error?: Error): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development' || !SLACK_WEBHOOK_URL

  if (isDev) {
    console.log('🔧 Development mode - mocking Slack notification:')
    console.log('📨 Mock Slack Message:')
    console.log({
      success: result.success,
      summary: result.summary,
      errors: result.errors.map(err => typeof err === 'string' ? err : JSON.stringify(err)),
      warnings: result.warnings.map(warn => typeof warn === 'string' ? warn : JSON.stringify(warn)),
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

  // Convert objects to strings and limit message length
  const formatField = (items: any[]): string => {
    const formatted = items.map(item => typeof item === 'string' ? item : JSON.stringify(item))
    const joined = formatted.join('\n')
    // Limit field length to prevent Slack message size issues
    return joined.length > 2000 ? `${joined.substring(0, 1900)}...\n[Message truncated - ${formatted.length} total items]` : joined
  }

  const payload = {
    attachments: [{
      color,
      title,
      text: result.summary.length > 500 ? `${result.summary.substring(0, 450)}...` : result.summary,
      fields: [
        ...(result.errors.length > 0
          ? [{
              title: `Errors (${result.errors.length})`,
              value: formatField(result.errors),
              short: false,
            }]
          : []),
        ...(result.warnings.length > 0
          ? [{
              title: `Warnings (${result.warnings.length})`,
              value: formatField(result.warnings),
              short: false,
            }]
          : []),
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

    await sendSlackNotification(result)

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

    await sendSlackNotification(failureResult, error instanceof Error ? error : new Error(String(error)))
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
