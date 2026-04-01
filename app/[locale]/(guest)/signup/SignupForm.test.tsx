import { describe, it, expect, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithNextintl } from '@/tests/rtl/utils/helper';
import { createMockFormData } from '@/tests/utils/mock';

import { SignUpForm } from '@/app/[locale]/(guest)/signup/SignupForm';
import { signupAction } from '@/features/auth/auth.action';
import { FIELDS } from '@/features/auth/constants/auth.field';
import { LENGTHS } from '@/features/auth/constants/auth.length';
import messages from '@/i18n/messages/en.json';
import { PASSWORD_ERROR_CODES } from '@/features/auth/results/auth.validationER.result';
import { successR } from '@/results/successR/successR.result';
import { INPUT } from '@/utils/constants/length';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';

vi.mock('@/features/auth/auth.action', () => ({
  signupAction: vi.fn(),
}));

describe('SignUpForm', () => {
  const metadataMessages = messages.metadata;

  const formMessages = messages.auth.component.signup.form;
  const successMessages = messages.auth.component.signup.success;
  
  const emailMessages = messages.auth.result.fieldErrorCodeMessages.email;
  const rawPwMessages = messages.auth.result.fieldErrorCodeMessages.password;
  const pwMessages = {
    ...rawPwMessages,
    too_short: rawPwMessages.too_short.replace('{min}', LENGTHS.PASSWORD_MIN.toString()),
    too_long: rawPwMessages.too_long.replace('{max}', LENGTHS.PASSWORD_MAX.toString()),
  };
  const pwcMessages = messages.auth.result.fieldErrorCodeMessages.password_confirmation;

  const emailLabelText = new RegExp(`^${formMessages.emailLabel}$`);
  const emailMsgContainerId = `${FIELDS.EMAIL} message`;
  const passwordLabelText = new RegExp(`^${formMessages.passwordLabel}$`);
  const passwordMsgContainerId = `${FIELDS.PASSWORD} message`;
  const passwordConfirmationLabelText = new RegExp(`^${formMessages.passwordConfirmationLabel}$`);
  const passwordConfirmationMsgContainerId = `${FIELDS.PASSWORD_CONFIRMATION} message`;
  const submitButtonText = new RegExp(`^${formMessages.signupButtonLabel}$`);

  const msgPrefix = '- ';
  const msgDefaultCN = 'text-txt-sub';
  const msgErrorCN = 'text-txt-dng';

  const nextSrpr = PROTECTED_ROUTES.MY;

  describe('email field:', () => {
    describe('initial state: ', () => {
      it('sets input and helper messages correctly.', () => {
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        // email field exists and is correctly linked to its message container
        const input = screen.getByLabelText(emailLabelText);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', FIELDS.EMAIL);
        expect(input).toHaveAttribute('aria-describedby', emailMsgContainerId);

        // message container exists and is connected via aria-describedby
        const messageContainer = document.getElementById(emailMsgContainerId) as unknown as HTMLElement;
        expect(messageContainer).toBeInTheDocument();

        // all email validation messages are shown in default(non-error) style
        Object.values(emailMessages).forEach(msg => {
          const messageElement = within(messageContainer).getByText(
            `${msgPrefix}${msg}`
          );
          expect(messageElement).toHaveClass(msgDefaultCN);
          expect(messageElement).not.toHaveClass(msgErrorCN);
        });
      });
    })

    describe('user types:', () => {
      it('updates input value.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(emailLabelText);

        await user.type(input, 'test@example.com');

        expect(input).toHaveValue('test@example.com');
      });

      it(`limits user input to maxLength ${INPUT.MAX}.`, async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(emailLabelText);
        const longValue = 't'.repeat(INPUT.MAX + 1);

        await user.type(input, longValue);

        expect(input).toHaveValue(longValue.slice(0, INPUT.MAX));
      });
    });

    describe('email validation on blur: ', () => {
      describe('valid email: ', () => {
        it('keeps default helper message when email format is valid.', async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const input = screen.getByLabelText(emailLabelText);
          const messageContainer = document.getElementById(emailMsgContainerId) as unknown as HTMLElement;

          await user.type(input, 'test@example.com');
          await user.tab();

          const message = within(messageContainer).getByText(
            `${msgPrefix}${emailMessages.invalid_format}`
          );

          expect(message).toHaveClass(msgDefaultCN);
          expect(message).not.toHaveClass(msgErrorCN);
        });
      });

      describe('invalid email: ', () => {
        it('turns into error message when email format is invalid.', async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const input = screen.getByLabelText(emailLabelText);
          const messageContainer = document.getElementById(emailMsgContainerId) as unknown as HTMLElement;

          await user.type(input, 'invalid-email');
          await user.tab();

          const message = within(messageContainer).getByText(
            `${msgPrefix}${emailMessages.invalid_format}`
          );

          expect(message).not.toHaveClass(msgDefaultCN);
          expect(message).toHaveClass(msgErrorCN);
        });
      });
    });
  });
  
  describe('password field:', () => {
    describe('initial state: ', () => {
      it('sets input and helper messagescorrectly.', () => {
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        // password field exists and is correctly linked to its message container
        const input = screen.getByLabelText(passwordLabelText);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', FIELDS.PASSWORD);
        expect(input).toHaveAttribute('aria-describedby', passwordMsgContainerId);
        expect(input).toHaveAttribute('type', 'password');

        // message container exists and is connected via aria-describedby
        const messageContainer = document.getElementById(passwordMsgContainerId) as unknown as HTMLElement;
        expect(messageContainer).toBeInTheDocument();

        // all password validation messages are shown in default(non-error) style
        Object.values(pwMessages).forEach(msg => {
          const messageElement = within(messageContainer).getByText(
            `${msgPrefix}${msg}`
          );
          expect(messageElement).toHaveClass(msgDefaultCN);
          expect(messageElement).not.toHaveClass(msgErrorCN);
        });
      });
    });

    describe('user types: ', () => {
      it('updates input value.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(passwordLabelText);

        await user.type(input, 'Password123!');

        expect(input).toHaveValue('Password123!');
      });

      it(`limits user input to maxLength ${LENGTHS.PASSWORD_MAX}.`, async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(passwordLabelText);

        const longValue = 'P'.repeat(LENGTHS.PASSWORD_MAX + 1);
        await user.type(input, longValue);

        expect(input).toHaveValue(longValue.slice(0, LENGTHS.PASSWORD_MAX));
      });
    });

    describe('password validation on blur: ', () => {
      describe('valid password: ', () => {
        it('keeps default helper messages when password is valid.', async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const input = screen.getByLabelText(passwordLabelText);
          const messageContainer = document.getElementById(passwordMsgContainerId) as unknown as HTMLElement;

          await user.type(input, 'Password1!');
          await user.tab();

          Object.values(pwMessages).forEach(msg => {
            const messageElement = within(messageContainer).getByText(
              `${msgPrefix}${msg}`
            );

            expect(messageElement).toHaveClass(msgDefaultCN);
            expect(messageElement).not.toHaveClass(msgErrorCN);
          });
        });
      });

      describe('invalid password: ', () => {
        it(`turns into error message when password length is shorter than ${LENGTHS.PASSWORD_MIN}.`, async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const input = screen.getByLabelText(passwordLabelText);
          const messageContainer = document.getElementById(passwordMsgContainerId) as unknown as HTMLElement;

          await user.click(input);
          await user.tab();

          Object.entries(pwMessages).forEach(([code, msg]) => {
            const messageElement = within(messageContainer).getByText(
              `${msgPrefix}${msg}`
            );

            if (code === PASSWORD_ERROR_CODES.TOO_LONG) {
              expect(messageElement).toHaveClass(msgDefaultCN);
              expect(messageElement).not.toHaveClass(msgErrorCN);
            } else {
              expect(messageElement).not.toHaveClass(msgDefaultCN);
              expect(messageElement).toHaveClass(msgErrorCN);
            }
          });
        });

        it(`turns into error message when password length is longer than ${LENGTHS.PASSWORD_MAX}.`, async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const input = screen.getByLabelText(passwordLabelText);
          const messageContainer = document.getElementById(passwordMsgContainerId) as unknown as HTMLElement;

          await user.type(input, 'P'.repeat(LENGTHS.PASSWORD_MAX + 1));
          await user.tab();

          Object.entries(pwMessages).forEach(([code, msg]) => {
            const messageElement = within(messageContainer).getByText(
              `${msgPrefix}${msg}`
            );

            // The "TOO LONG" error does not occur
            // because the maxLength attribute prevents additional input.
            if (code === PASSWORD_ERROR_CODES.TOO_SHORT
              || code === PASSWORD_ERROR_CODES.TOO_LONG
              || code === PASSWORD_ERROR_CODES.MISSING_UPPERCASE
            ) {
              expect(messageElement).toHaveClass(msgDefaultCN);
              expect(messageElement).not.toHaveClass(msgErrorCN);
            } else {
              expect(messageElement).not.toHaveClass(msgDefaultCN);
              expect(messageElement).toHaveClass(msgErrorCN);
            }
          });
        });
      });
    });

    describe('visibility toggle: ', () => {
      it('toggles password visibility when the toggle button is clicked.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const passwordInput = screen.getByLabelText(passwordLabelText);
        const passwordToggle = screen.getByRole('button', { name: formMessages.showPasswordAriaLabel });

        // Initially hidden
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');

        // Click to show
        await user.click(passwordToggle);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(passwordToggle).toHaveAttribute('aria-pressed', 'true');

        // Click to hide again
        await user.click(passwordToggle);
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  describe('password confirmation field: ', () => {
    describe('initial state: ', () => {
      it('sets input and helper messages correctly.', () => {
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        // password confirmation field exists and is correctly linked to its message container
        const input = screen.getByLabelText(passwordConfirmationLabelText);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', FIELDS.PASSWORD_CONFIRMATION);
        expect(input).toHaveAttribute('aria-describedby', passwordConfirmationMsgContainerId);
        expect(input).toHaveAttribute('type', 'password');

        // message container exists and is connected via aria-describedby
        const messageContainer = document.getElementById(passwordConfirmationMsgContainerId) as unknown as HTMLElement;
        expect(messageContainer).toBeInTheDocument();

        // all password confirmation validation messages are shown in default(non-error) style
        Object.values(pwcMessages).forEach(msg => {
          const messageElement = within(messageContainer).getByText(
            `${msgPrefix}${msg}`
          );
          expect(messageElement).toHaveClass(msgDefaultCN);
          expect(messageElement).not.toHaveClass(msgErrorCN);
        });
      });
    });

    describe('user types: ', () => {
      it('updates input value.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(passwordConfirmationLabelText);

        await user.type(input, 'Password123!');

        expect(input).toHaveValue('Password123!');
      });

      it(`limits user input to maxLength ${LENGTHS.PASSWORD_MAX}.`, async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(passwordConfirmationLabelText);

        const longValue = 'P'.repeat(LENGTHS.PASSWORD_MAX + 1);
        await user.type(input, longValue);

        expect(input).toHaveValue(longValue.slice(0, LENGTHS.PASSWORD_MAX));
      });
    });

    describe('password confirmation validation on blur: ', () => {
      describe('valid password confirmation: ', () => {
        it('keeps default helper messages when password confirmation matches password.', async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const passwordInput = screen.getByLabelText(passwordLabelText);
          const input = screen.getByLabelText(passwordConfirmationLabelText);
          const messageContainer = document.getElementById(passwordConfirmationMsgContainerId) as unknown as HTMLElement;

          await user.type(passwordInput, 'p');
          await user.type(input, 'p');
          await user.tab();

          Object.values(pwcMessages).forEach(msg => {
            const messageElement = within(messageContainer).getByText(
              `${msgPrefix}${msg}`
            );

            expect(messageElement).toHaveClass(msgDefaultCN);
            expect(messageElement).not.toHaveClass(msgErrorCN);
          });
        });
      });

      describe('invalid password confirmation: ', () => {
        it(`turns into error message when password confirmation does not match password.`, async () => {
          const user = userEvent.setup();
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const passwordInput = screen.getByLabelText(/^Password$/);
          const input = screen.getByLabelText(passwordConfirmationLabelText);
          const messageContainer = document.getElementById(passwordConfirmationMsgContainerId) as unknown as HTMLElement;

          await user.type(passwordInput, 'p');
          await user.click(input);
          await user.tab();

          Object.values(pwcMessages).forEach(msg => {
            const messageElement = within(messageContainer).getByText(
              `${msgPrefix}${msg}`
            );

            expect(messageElement).not.toHaveClass(msgDefaultCN);
            expect(messageElement).toHaveClass(msgErrorCN);
          });
        });
      });
    });

    describe('visibility toggle: ', () => {
      it('toggles password confirmation visibility when the toggle button is clicked.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const input = screen.getByLabelText(passwordConfirmationLabelText);
        const toggle = screen.getByRole('button', { name: formMessages.showPasswordConfirmationAriaLabel });

        // Initially hidden
        expect(input).toHaveAttribute('type', 'password');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');

        // Click to show
        await user.click(toggle);
        expect(input).toHaveAttribute('type', 'text');
        expect(toggle).toHaveAttribute('aria-pressed', 'true');

        // Click to hide again
        await user.click(toggle);
        expect(input).toHaveAttribute('type', 'password');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
      });
    });
  })

  describe('password and password confirmation: ', () => {
    it('triggers password confirmation validation when password is blurred and password confirmation is not empty.', async () => {
      const user = userEvent.setup();
      renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

      const passwordInput = screen.getByLabelText(passwordLabelText);
      const confirmInput = screen.getByLabelText(passwordConfirmationLabelText);
      const confirmMessageContainer = document.getElementById(passwordConfirmationMsgContainerId) as HTMLElement;

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Password123!');
      await user.type(passwordInput, 'Password123@');
      await user.tab();

      Object.values(pwcMessages).forEach(msg => {
        const messageElement = within(confirmMessageContainer).getByText(
          `${msgPrefix}${msg}`
        );

        expect(messageElement).not.toHaveClass(msgDefaultCN);
        expect(messageElement).toHaveClass(msgErrorCN);
      });
    });
  })

  describe('submit button: ', () => {
    describe('initial state: ', () => {
      it('initial state.', () => {
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const submitButton = screen.getByRole('button', { name: submitButtonText });

        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveAttribute('type', 'submit');
        expect(submitButton).toHaveAttribute('tabIndex', '-1');
      });
    });

    describe('enabling conditions: ', () => {
      it('is enabled when all fields are valid.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const emailInput = screen.getByLabelText(emailLabelText);
        const passwordInput = screen.getByLabelText(passwordLabelText);
        const confirmInput = screen.getByLabelText(passwordConfirmationLabelText);
        const submitButton = screen.getByRole('button', { name: submitButtonText });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.type(confirmInput, 'Password123!');

        expect(submitButton).toBeEnabled();
      });
    });

    describe('disabling conditions: ', () => {
      it('remains disabled when email and password are filled and password confirmation does not match password.', async () => {
        const user = userEvent.setup();
        renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

        const emailInput = screen.getByLabelText(emailLabelText);
        const passwordInput = screen.getByLabelText(passwordLabelText);
        const confirmInput = screen.getByLabelText(passwordConfirmationLabelText);
        const submitButton = screen.getByRole('button', { name: submitButtonText });

        await user.type(emailInput, 'test@example.com');
        await user.tab();
        expect(submitButton).toBeDisabled();

        await user.type(passwordInput, 'Password123!');
        await user.tab();
        expect(submitButton).toBeDisabled();

        await user.type(confirmInput, 'DifferentPassword123!');
        await user.tab();
        expect(submitButton).toBeDisabled();
      });
    });

    describe('form submission: ', () => {
      describe('successR: ', () => {
        it('calls signupAction with correct form data and displays success when submitted.', async () => {
          const mockEmail = 'test@example.com';
          const mockPassword = 'Password123!';
          const mockPasswordConfirmation = 'Password123!';

          const user = userEvent.setup();
          vi.mocked(signupAction).mockResolvedValue(
            successR({email: mockEmail})
          );
          
          renderWithNextintl(<SignUpForm next={nextSrpr} />, {});

          const emailInput = screen.getByLabelText(emailLabelText);
          const passwordInput = screen.getByLabelText(passwordLabelText);
          const confirmInput = screen.getByLabelText(passwordConfirmationLabelText);
          const submitButton = screen.getByRole('button', { name: submitButtonText });

          await user.type(emailInput, mockEmail);
          await user.type(passwordInput, mockPassword);
          await user.type(confirmInput, mockPasswordConfirmation);
          await user.click(submitButton);

          expect(signupAction).toHaveBeenCalledOnce();
          expect(signupAction).toHaveBeenCalledWith(
            nextSrpr,
            undefined,
            createMockFormData({
              [FIELDS.EMAIL]: mockEmail,
              [FIELDS.PASSWORD]: mockPassword,
              [FIELDS.PASSWORD_CONFIRMATION]: mockPasswordConfirmation,
            })
          );

          await waitFor(() => {
            expect(screen.getByText(successMessages.candy.title)).toBeInTheDocument();
          });
          expect(screen.getByText(successMessages.candy.details.replace('{email}', mockEmail))).toBeInTheDocument();
          expect(screen.getByText(successMessages.candy.warning)).toBeInTheDocument();

          expect(screen.queryByLabelText(emailLabelText)).not.toBeInTheDocument();
          expect(screen.queryByLabelText(passwordLabelText)).not.toBeInTheDocument();
          expect(screen.queryByLabelText(passwordConfirmationLabelText)).not.toBeInTheDocument();
        });
      })
    });
  });
});