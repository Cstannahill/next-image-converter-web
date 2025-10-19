import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the upload helper so page mounts without attempting network
vi.mock('../../lib/upload', () => ({
    uploadFormDataWithProgress: vi.fn(),
}))

import HomePage from '../page'

describe('HomePage control enablement', () => {
    // Radix tries to call scrollIntoView on candidates; JSDOM may not provide it.
    beforeAll(() => {
        if (!('scrollIntoView' in Element.prototype)) {
            // @ts-ignore
            Element.prototype.scrollIntoView = function () { }
        }
    })

    beforeEach(() => {
        // noop
    })

    it('enables Quality only for lossy formats and disables otherwise', async () => {
        render(<HomePage />)

        const quality = screen.getByLabelText(/quality/i) as HTMLInputElement
        // initial format is PNG (not lossy) so quality should be disabled
        expect(quality).toBeDisabled()

        // open the format combobox and choose JPEG (lossy)
        const combobox = screen.getByRole('combobox')
        fireEvent.click(combobox)
        const jpeg = await screen.findByText('JPEG')
        fireEvent.click(jpeg)

        await waitFor(() => expect(quality).not.toBeDisabled())

        // switch back to PNG and expect it disabled again
        fireEvent.click(combobox)
        const png = await screen.findByText('PNG')
        fireEvent.click(png)
        await waitFor(() => expect(quality).toBeDisabled())
    })

    it('enables DPI and Scale only when SVG is selected', async () => {
        render(<HomePage />)

        const dpi = screen.getByLabelText(/dpi/i) as HTMLInputElement
        const scale = screen.getByLabelText(/scale/i) as HTMLInputElement

        // initial (PNG) should be disabled
        expect(dpi).toBeDisabled()
        expect(scale).toBeDisabled()

        const combobox = screen.getByRole('combobox')
        fireEvent.click(combobox)
        const svg = await screen.findByText('SVG')
        fireEvent.click(svg)

        await waitFor(() => {
            expect(dpi).not.toBeDisabled()
            expect(scale).not.toBeDisabled()
        })

        // go back to PNG
        fireEvent.click(combobox)
        const png = await screen.findByText('PNG')
        fireEvent.click(png)

        await waitFor(() => {
            expect(dpi).toBeDisabled()
            expect(scale).toBeDisabled()
        })
    })
})
