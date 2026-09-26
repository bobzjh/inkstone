import { describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from './clipboard'

describe('copyTextToClipboard', () => {
  it('uses the async clipboard when it is available', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    await expect(copyTextToClipboard('git push')).resolves.toBeUndefined()
    expect(writeText).toHaveBeenCalledWith('git push')
  })

  it('falls back to a selection copy when the async clipboard rejects', async () => {
    const writeText = vi.fn(async () => {
      throw new DOMException('Document is not focused.', 'NotAllowedError')
    })
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const execCommand = vi.fn(() => true)
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })

    await expect(copyTextToClipboard('npm run dev')).resolves.toBeUndefined()

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('rejects when no copy path succeeds', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: () => false })
    await expect(copyTextToClipboard('x')).rejects.toThrow()
    expect(document.querySelector('textarea')).toBeNull()
  })
})
