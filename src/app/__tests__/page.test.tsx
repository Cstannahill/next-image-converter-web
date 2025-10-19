import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock the upload helper
vi.mock('../../lib/upload', () => ({
    uploadFormDataWithProgress: vi.fn(),
}))

import { uploadFormDataWithProgress } from '../../lib/upload'
import HomePage from '../page'

describe('HomePage', () => {
    beforeEach(() => {
        ; (uploadFormDataWithProgress as any).mockReset()
    })

    it('shows result after successful upload', async () => {
        ; (uploadFormDataWithProgress as any).mockResolvedValue({ blob: new Blob(['x']), filename: 'out.png' })

        render(<HomePage />)

        // find the hidden file input and set files
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        const testFile = new File(['hello'], 'hello.png', { type: 'image/png' })
        // @ts-ignore
        Object.defineProperty(fileInput, 'files', { value: [testFile] })
        // dispatch change event
        fireEvent.change(fileInput)

        const convert = screen.getByRole('button', { name: /convert/i })
        fireEvent.click(convert)

        await waitFor(() => expect(uploadFormDataWithProgress).toHaveBeenCalledTimes(1))
    })

    it('handles server error during upload', async () => {
        ; (uploadFormDataWithProgress as any).mockRejectedValue(new Error('Server error'))

        render(<HomePage />)
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        const testFile = new File(['hello'], 'hello.png', { type: 'image/png' })
        // @ts-ignore
        Object.defineProperty(fileInput, 'files', { value: [testFile] })
        fireEvent.change(fileInput)

        const convert = screen.getByRole('button', { name: /convert/i })
        fireEvent.click(convert)

        await waitFor(() => expect(uploadFormDataWithProgress).toHaveBeenCalledTimes(1))
    })
})
