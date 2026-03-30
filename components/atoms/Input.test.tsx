import { describe, it, expect, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '@/components/atoms/Input';

describe('Input', () => {
  const handleChange = vi.fn();
  const handleBlur = vi.fn();

  const props = {
    idName: 'test_input',
    ariaDescribedby: 'test_aria_describedby',
    type: 'text' as const,
    placeholder: 'test placeholder',
    maxLength: 100,

    value: 'test value',
    onChange: handleChange,
    onBlur: handleBlur,
    className: 'test-className'
  };

  describe('rendering input with props attributes: ', () => {
      it('renders an input with props attributes.', () => {
      render(<Input {...props} />);

      const input = screen.getByPlaceholderText(props.placeholder);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', props.idName);
      expect(input).toHaveAttribute('name', props.idName);
      expect(input).toHaveAttribute('aria-describedby', props.ariaDescribedby);
      expect(input).toHaveAttribute('type', props.type);
      expect(input).toHaveAttribute('placeholder', props.placeholder);
      expect(input).toHaveAttribute('maxlength', props.maxLength.toString());

      expect(input).toHaveValue(props.value);
      expect(input).toHaveClass(props.className);
    });
  });

  describe('value attribute: ', () => {
    it('renders controlled value.', () => {
      render(<Input {...props} value="Hello" />);

      const input = screen.getByPlaceholderText(props.placeholder);
      expect(input).toHaveValue('Hello');
    });

    it('renders empty string when value is not provided.', () => {
      const { value, ...propsWithoutValue } = props;
      render(<Input {...propsWithoutValue} />);

      const input = screen.getByPlaceholderText(props.placeholder);
      expect(input).toHaveValue('');
    });
  });

  describe('onSomething and maxLength attributes: ', () => {
    it('calls onChange when user types.', async () => {
      const user = userEvent.setup();

      render(<Input {...props} />);

      const input = screen.getByPlaceholderText(props.placeholder);
      await user.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalledTimes(5);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: expect.any(String),
          }),
        })
      );
    });

    it('limits user input to the maxLength.', async () => {
      const user = userEvent.setup();
      const { value, ...propsWithoutValue } = props;
      render(<Input {...propsWithoutValue} maxLength={5} />);

      const input = screen.getByPlaceholderText(props.placeholder);
      await user.type(input, '123456789');

      expect(input).toHaveValue('12345');
    });

    it('calls onBlur when input loses focus.', async () => {
      const user = userEvent.setup();

      render(<Input {...props} />);

      const input = screen.getByPlaceholderText(props.placeholder);
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalledOnce();
      expect(handleBlur).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'blur',
        })
      );
    })
  });
});