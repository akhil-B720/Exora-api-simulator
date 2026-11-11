import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JsonEditor } from '../components/JsonEditor';

describe('JsonEditor Component', () => {
  it('renders JSON payload title and buttons', () => {
    const handleChange = vi.fn();
    render(<JsonEditor value='{"key": "value"}' onChange={handleChange} />);

    expect(screen.getByText('JSON Payload')).toBeInTheDocument();
    expect(screen.getByText('Format JSON')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('displays syntax error banner on invalid JSON', () => {
    const handleChange = vi.fn();
    render(<JsonEditor value='{invalid-json' onChange={handleChange} />);

    expect(screen.getByText(/Syntax Error:/i)).toBeInTheDocument();
  });

  it('calls clear handler when Clear is clicked', () => {
    const handleChange = vi.fn();
    render(<JsonEditor value='{"id": 1}' onChange={handleChange} />);

    fireEvent.click(screen.getByText('Clear'));
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
