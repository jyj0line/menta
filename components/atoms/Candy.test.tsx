import { describe, it, expect } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Candy } from '@/components/atoms/Candy';

describe('@/components/atoms/Candy.tsx', () => {
  describe('Candy', () => {
    const props = {
      title: 'Test Menu',
      details: 'Test Detail',

      warning: 'Test Warning',
      className: 'custom-candy'
    };

    describe('rendering with props: ', () => {
      it('renders Candy with props.', () => {
        const { container } = render(<Candy {...props} />);

        const menu = screen.getByRole('heading', { level: 1 });
        expect(menu).toHaveTextContent(props.title);

        const detail = screen.getByText(props.details);
        expect(detail).toBeInTheDocument();

        const warning = screen.getByRole('heading', { level: 2 });
        expect(warning).toHaveTextContent(props.warning);

        expect(container.firstChild).toHaveClass(props.className);
      });
    });
  });
});