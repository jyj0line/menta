import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithNextintl } from '@/tests/vitest/utils/helper';

import { Button, Toggle, Link, Logo } from '@/components/atoms/Click';

import * as routeHelperModule from '@/utils/helpers/route.helper';

describe('@/components/atoms/Click.tsx', () => {
  describe('Button', () => {
    const handleClick = vi.fn();
    const props = {
      type: 'button' as const,
      label: 'Test Button',
      disabled: false,
      tabIndex: 0,

      onClick: handleClick,
      className: 'custom-button'
    };

    describe('rendering button with props attributes: ', () => {
      it('renders a button with props attributes.', () => {
        render(<Button {...props} />);

        const button = screen.getByRole('button', { name: props.label });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'button');
        expect(button).not.toBeDisabled();
        expect(button).toHaveAttribute('tabIndex', '0');
        expect(button).toHaveClass('custom-button');
      });
    });

    describe('disabled attribute and click event: ', () => {
      it('is enabled and clickable when disabled is false', async () => {
        const user = userEvent.setup();

        render(<Button {...props} disabled={false} />);
        
        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();

        await user.click(button);
        expect(handleClick).toHaveBeenCalledOnce();
        expect(handleClick).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'click',
          })
        );
      });

      it('is disabled and not clickable when disabled is true', async () => {
        const user = userEvent.setup();

        render(<Button {...props} disabled={true} />);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        
        await user.click(button);
        expect(handleClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('Toggle', () => {
    const handleClick = vi.fn();
    const props = {
      ariaLabel: 'toggle label',
      ariaPressed: false,
      disabled: false,
      tabIndex: 0,
      onClick: handleClick,
      children: 'Off',

      className: 'custom-toggle'
    };

    describe('rendering button with props attributes, and click event: ', () => {
      it('renders a button with props attributes, and click event.', async () => {
        const user = userEvent.setup();
        render(<Toggle {...props} />);

        const toggle = screen.getByRole('button');
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-label', props.ariaLabel);
        expect(toggle).toHaveAttribute('aria-pressed', props.ariaPressed.toString());
        expect(toggle).toHaveAttribute('tabIndex', props.tabIndex.toString());
        expect(toggle).toHaveTextContent(props.children.toString());
        expect(toggle).toHaveClass(props.className);

        await user.click(toggle);
        expect(handleClick).toHaveBeenCalledOnce();
        expect(handleClick).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'click',
          })
        );
      });
    });
  });

  describe('Link', () => {
    const props = {
      href: '/',
      children: 'About',

      className: 'custom-link'
    };

    describe('rendering link with props attributes: ', () => {
      it('renders a link with props attributes.', () => {
        render(<Link {...props} />);

        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', props.href);
        expect(link).toHaveTextContent(props.children.toString());
        expect(link).toHaveClass(props.className);
      });
    });

    describe('href security: ', () => {
      it('processes href through getSafePathname() to ensure safety.', () => {
        const spy = vi.spyOn(routeHelperModule, 'getSafePathname');
        const inputtedHref = '/some/../path';
        const expectedSafeHref = routeHelperModule.getSafePathname(inputtedHref);

        render(<Link href={inputtedHref}>Click me</Link>);

        expect(spy).toHaveBeenCalledWith(inputtedHref);
        expect(screen.getByRole('link')).toHaveAttribute('href', expectedSafeHref);
      });
    })
  });

  describe('Logo', () => {
    const props = {
      classNameH: 'h-[2rem]'
    }

    describe('rendering link with props attributes: ', () => {
      it('renders a link with props attributes.', () => {
        renderWithNextintl(<Logo {...props} />, {});

        const logo = screen.getByRole('link', { name: 'Menta Logo' });
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveClass(props.classNameH);
      });
    });

    describe('specified rendering and attributes: ', () => {
      it('renders a link to the root(\'/\') pathname.', () => {
        renderWithNextintl(<Logo {...props} />, {});

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
      });

      it('renders an SVG element inside the link', () => {
        renderWithNextintl(<Logo {...props} />, {});

        const link = screen.getByRole('link');
        const svg = link.querySelector('svg');
        
        expect(svg).toBeInTheDocument();
      });
    });
  });
});