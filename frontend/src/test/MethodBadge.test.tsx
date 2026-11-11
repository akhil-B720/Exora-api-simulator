import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MethodBadge } from '../components/MethodBadge';

describe('MethodBadge Component', () => {
  it('renders GET method badge correctly', () => {
    render(<MethodBadge method="GET" />);
    const badge = screen.getByText('GET');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-blue-400');
  });

  it('renders POST method badge correctly', () => {
    render(<MethodBadge method="POST" />);
    const badge = screen.getByText('POST');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-400');
  });

  it('renders DELETE method badge correctly', () => {
    render(<MethodBadge method="DELETE" />);
    const badge = screen.getByText('DELETE');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-rose-400');
  });
});
