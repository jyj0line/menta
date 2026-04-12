import { describe, it, expect, vi } from 'vitest';

import { createMockFormData } from '@/tests/helper.mock';

import { signupUsecase, loginUsecase } from '@/features/auth/auth.usecase';
import { type AuthService } from '@/features/auth/auth.service';
import { FIELDS } from '@/features/auth/constants/auth.field';
import { LOGIN_ERROR_CODES, loginER } from '@/features/auth/results/auth.loginER.result';
import { EMAIL_ERROR_CODES, PASSWORD_ERROR_CODES, PASSWORD_CONFIRMAITON_ERROR_CODES } from '@/features/auth/results/auth.validationER.result';
import { validationER } from '@/results/errorR/validationER.result';

import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { type CacheService } from '@/utils/service';
import { successR } from '@/results/successR/successR.result';
import { unexpectedER } from '@/results/errorR/unexpectedER.result';

const mockAuthService: AuthService = {
  signup: vi.fn(),
  login: vi.fn(),
};

const mockCacheService: CacheService = {
  revalidatePathname: vi.fn(),
};

describe('@/features/auth/auth.usecase.ts', () => {
  const validEmail = 'test@example.com';
  const validPassword = 'Password1!';
  const validPasswordConfirmation = 'Password1!';

  describe('signupUsecase', () => {
    describe('returns SuccessR with the email(inputted) property and revalidate path when validation and singup service succeeds: ', () => {
      it('returns SuccessR with the email(inputted) property and revalidate path when validation and singup service succeeds.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: validPassword,
          [FIELDS.PASSWORD_CONFIRMATION]: validPasswordConfirmation
        });
        const expectedResult = successR({ [FIELDS.EMAIL]: validEmail });
        vi.mocked(mockAuthService.signup).mockResolvedValue(expectedResult);

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).toHaveBeenCalledWith(validEmail, validPassword, PROTECTED_ROUTES.MY);
        expect(mockCacheService.revalidatePathname).toHaveBeenCalledWith('/', 'layout');
      })
    })

    describe('returns validationER with email, password, and password confirmation fields when validation fails: ', () => {
      it('returns ValidationER when email field is invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: 'invalid-email',
          [FIELDS.PASSWORD]: validPassword,
          [FIELDS.PASSWORD_CONFIRMATION]: validPasswordConfirmation
        });
        const expectedResult = validationER({
          [FIELDS.EMAIL]: [EMAIL_ERROR_CODES.INVALID_FORMAT],
        });

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns ValidationER when password field is invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: 'weak',
          [FIELDS.PASSWORD_CONFIRMATION]: validPasswordConfirmation
        });
        const expectedResult = validationER({
          [FIELDS.PASSWORD]: [
            PASSWORD_ERROR_CODES.TOO_SHORT,
            PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
            PASSWORD_ERROR_CODES.MISSING_NUMBER,
            PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
          ],
          [FIELDS.PASSWORD_CONFIRMATION]: [PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH]
        });

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns ValidationER when password confirmation field is invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: validPassword,
          [FIELDS.PASSWORD_CONFIRMATION]: 'weak'
        });
        const expectedResult = validationER({
          [FIELDS.PASSWORD_CONFIRMATION]: [PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH]
        });

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns ValidationER when password and password confirmation fields do not match.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: validPassword,
          [FIELDS.PASSWORD_CONFIRMATION]: 'Password2!'
        });
        const expectedResult = validationER({
          [FIELDS.PASSWORD_CONFIRMATION]: [PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH]
        });

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns ValidationER when all(email, password and password confirmation) fields are invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: '',
          [FIELDS.PASSWORD]: '',
          [FIELDS.PASSWORD_CONFIRMATION]: ''
        });
        const expectedResult = validationER({
          [FIELDS.EMAIL]: [EMAIL_ERROR_CODES.INVALID_FORMAT],
          [FIELDS.PASSWORD]:[
            PASSWORD_ERROR_CODES.TOO_SHORT,
            PASSWORD_ERROR_CODES.MISSING_LOWERCASE,
            PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
            PASSWORD_ERROR_CODES.MISSING_NUMBER,
            PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
          ]
        });

        const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.signup).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      });
    })

    describe('returns UnexpectedER when auth service fails: ', () => {
      it('returns unexpectedER when the auth service fails unexpectedly.', async () => {
        // given: valid form data
          const formData = createMockFormData({
              [FIELDS.EMAIL]: validEmail,
              [FIELDS.PASSWORD]: validPassword,
              [FIELDS.PASSWORD_CONFIRMATION]: validPassword,
          });
          const expectedResult = unexpectedER();
          vi.mocked(mockAuthService.signup).mockResolvedValue(expectedResult);

          const result = await signupUsecase(formData, PROTECTED_ROUTES.MY, mockAuthService, mockCacheService);

          expect(result).toEqual(expectedResult);
          expect(mockAuthService.signup).toHaveBeenCalledWith(validEmail, validPassword, PROTECTED_ROUTES.MY);
          expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })
    })
  });

  describe('loginUsecase', () => {
    describe('returns SuccessR with true and revalidate path when validation and login service succeeds: ', () => {
      it('returns SuccessR with true and revalidate path when validation and login service succeeds.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: validPassword
        });
        const expectedResult = successR(true as const);
        vi.mocked(mockAuthService.login).mockResolvedValue(expectedResult);

        const result = await loginUsecase(formData, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.login).toHaveBeenCalledWith(validEmail, validPassword);
        expect(mockCacheService.revalidatePathname).toHaveBeenCalledWith('/', 'layout');
      })
    })

    describe('returns loginER with auth error code(invalid credentials) when validation fails: ', () => {
      const expectedResult = loginER(LOGIN_ERROR_CODES.INVALID_CREDENTIALS);

      it('returns loginER when email field is invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: 'invalid-email',
          [FIELDS.PASSWORD]: validPassword
        });

        const result = await loginUsecase(formData, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.login).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns loginER when password field is invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: 'weak'
        });

        const result = await loginUsecase(formData, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.login).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns loginER when all(email, password) fields are invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: '',
          [FIELDS.PASSWORD]: ''
        });

        const result = await loginUsecase(formData, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.login).not.toHaveBeenCalled();
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      });
    })

    describe('returns loginER with auth error code(invalid credentials) or UnexpectedER when auth service fails: ', () => {
      it('returns loginER when the credentials invalid.', async () => {
        const formData = createMockFormData({
          [FIELDS.EMAIL]: validEmail,
          [FIELDS.PASSWORD]: validPassword,
        });
        const expectedResult = loginER(LOGIN_ERROR_CODES.INVALID_CREDENTIALS);
        vi.mocked(mockAuthService.login).mockResolvedValue(expectedResult);

        const result = await loginUsecase(formData, mockAuthService, mockCacheService);

        expect(result).toEqual(expectedResult);
        expect(mockAuthService.login).toHaveBeenCalledWith(validEmail, validPassword);
        expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })

      it('returns unexpectedER when the auth service fails unexpectedly.', async () => {
          const formData = createMockFormData({
              [FIELDS.EMAIL]: validEmail,
              [FIELDS.PASSWORD]: validPassword
          });
          const expectedResult = unexpectedER();
          vi.mocked(mockAuthService.login).mockResolvedValue(expectedResult);

          const result = await loginUsecase(formData, mockAuthService, mockCacheService);

          expect(result).toEqual(expectedResult);
          expect(mockAuthService.login).toHaveBeenCalledWith(validEmail, validPassword);
          expect(mockCacheService.revalidatePathname).not.toHaveBeenCalled();
      })
    })
  });
});
