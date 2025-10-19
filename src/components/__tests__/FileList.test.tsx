import React from 'react'
import { render, screen } from '@testing-library/react'
import FileList from '../FileList'

const makeFile = (name: string) => new File(['abc'], name, { type: 'image/png' })

describe('FileList', () => {
    it('shows no files when empty', () => {
        render(<FileList items={[]} onRemove={() => { }} />)
        expect(screen.getByText(/No files selected/i)).toBeInTheDocument()
    })

    it('renders files', () => {
        const f = makeFile('foo.png')
        render(<FileList items={[{ id: '1', file: f }]} onRemove={() => { }} />)
        expect(screen.getByText('foo.png')).toBeInTheDocument()
    })
})
