import React from 'react'
import { render, screen } from '@testing-library/react'
import ProgressBar from '../ProgressBar'

describe('ProgressBar', () => {
    it('renders value and label', () => {
        render(<ProgressBar value={42} label="Uploading" />)
        expect(screen.getByText('Uploading')).toBeInTheDocument()
        expect(screen.getByText('42%')).toBeInTheDocument()
    })
})
