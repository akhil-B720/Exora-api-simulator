import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders 200 OK status badge with emerald styling', () => {
    render(<StatusBadge status={200} />);
    const badge = screen.getByText('200');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-400');
  });

  it('renders 404 Not Found status badge with amber styling', () => {
    render(<StatusBadge status={404} />);
    const badge = screen.getByText('404');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-amber-400');
  });

  it('renders 500 Server Error status badge with rose styling', () => {
    render(<StatusBadge status={500} />);
    const badge = screen.getByText('500');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-rose-400');
  });
});
