import { describe, it, expect } from 'vitest';
import * as z from 'zod';
import { assertSafeParseSuccess, assertSafeParseError } from '@/tests/vitest/utils/helper';

import {
  emailSchema,
  passwordSchema,
  signupFormDataSchema,
  loginFormDataSchema
} from '@/features/auth/auth.schema';

import {
    EMAIL_ERROR_CODES,
    PASSWORD_ERROR_CODES,
    PASSWORD_CONFIRMAITON_ERROR_CODES
} from '@/features/auth/results/auth.validationER.result';
import {
    FIELDS.EMAIL,
    FIELDS.PASSWORD, FIELDS.PASSWORD_CONFIRMATION
} from '@/features/auth/constants/auth.field';

describe('@/feature/auth/auth.schema.test.ts', () => {
    describe('common schemas', () => {
        describe('emailSchema', () => {
            describe('valid email: ', () => {
                it.each([
                    'test@example.com',
                    'user.name@domain.co.kr',
                    'admin+tag@company.org'
                ])(
                    'passes. (%s)',
                    (email) => {
                        const res = emailSchema.safeParse(email);

                        assertSafeParseSuccess(res);
                        expect(res.data).toBe(email);
                    }
                )
            })

            describe('invalid email: ', () => {
                it.each([
                    'invalid',
                    'test@',
                    '@domain.com',
                    'test @domain.com',
                    'test@domain',
                    '',
                ])('fails. (%s)', (email) => {
                    const res = emailSchema.safeParse(email);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        EMAIL_ERROR_CODES.INVALID_FORMAT
                    ]);
                })
            })
        })

        describe('passwordSchema', () => {
            describe('valid password: ', () => {
                it.each([
                    'Password1!',
                    'Test123!@#',
                    'Abcd1234!@',
                    'MyP@ssw0rd'
                ])(
                    'passes. (%s)',
                    (password) => {
                        const res = passwordSchema.safeParse(password);

                        assertSafeParseSuccess(res);
                        expect(res.data).toBe(password);
                    }
                )
            });

            describe('invalid password: ', () => {
                it('fails when the password is shorter than the minimum length 8.', () => {
                    const res = passwordSchema.safeParse('Abc1!');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT
                    ]);
                })

                it('fails when the password is longer than the maximum length 128.', () => {
                    const res = passwordSchema.safeParse('Abc1!' + 'a'.repeat(500));

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.TOO_LONG
                    ]);
                })

                it('fails when the password does not contain a lowercase letter.', () => {
                    const res = passwordSchema.safeParse('PASSWORD1!');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.MISSING_LOWERCASE
                    ]);
                })

                it('fails when the password does not contain an uppercase letter.', () => {
                    const res = passwordSchema.safeParse('password1!');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE
                    ]);
                })

                it('fails when the password does not contain a digit.', () => {
                    const res = passwordSchema.safeParse('Password!');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.MISSING_NUMBER
                    ]);
                })

                it('fails when the password does not contain a special character.', () => {
                    const res = passwordSchema.safeParse('Password1');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                })

                it('fails when the password violates all of the above requirements expect for the minimum length 8.', () => {
                    const res = passwordSchema.safeParse('');

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT,
                        PASSWORD_ERROR_CODES.MISSING_LOWERCASE,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                })

                it('fails when the password violates all of the above requirements expect for the maximum length 128 and the uppercase letter.', () => {
                    const res = passwordSchema.safeParse('a'.repeat(500));

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).formErrors).toEqual([
                        PASSWORD_ERROR_CODES.TOO_LONG,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                })
            })
        })
    })

    describe('composed schemas', () => {
        describe('signUpFormDataSchema', () => {
            describe('valid sign up form data: ', () => {
                it('passes when all(email, password, and password confirmation) fields are valid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'test@example.com',
                        [FIELDS.PASSWORD]: 'Password1!',
                        [FIELDS.PASSWORD_CONFIRMATION]: 'Password1!'
                    }

                    const res = signupFormDataSchema.safeParse(data);

                    assertSafeParseSuccess(res);
                    expect(res.data).toEqual(data);
                })
            })

            describe('invalid sign up form data: ', () => {
                it('fails when email field is invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'invalid-email',
                        [FIELDS.PASSWORD]: 'Password1!',
                        [FIELDS.PASSWORD_CONFIRMATION]: 'Password1!'
                    }

                    const res = signupFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.EMAIL]).toEqual([
                        EMAIL_ERROR_CODES.INVALID_FORMAT
                    ]);
                })

                it('fails when password and password confirmation fields are invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'test@example.com',
                        [FIELDS.PASSWORD]: 'weak',
                        [FIELDS.PASSWORD_CONFIRMATION]: 'weakk'
                    }

                    const res = signupFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD]).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD_CONFIRMATION]).toEqual([
                         PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH
                    ]);
                })

                it('fails when password and password confirmation fileds do not match.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'test@example.com',
                        [FIELDS.PASSWORD]: 'Password1!',
                        [FIELDS.PASSWORD_CONFIRMATION]: 'Password2!'
                    }

                    const res = signupFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD_CONFIRMATION]).toEqual([
                        PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH
                    ]);
                })

                it('fails when all(email, password, and password confirmation) fields are invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'invalid',
                        [FIELDS.PASSWORD]: 'weak',
                        [FIELDS.PASSWORD_CONFIRMATION]: 'different'
                    }

                    const res = signupFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.EMAIL]).toEqual([
                        EMAIL_ERROR_CODES.INVALID_FORMAT
                    ]);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD]).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD_CONFIRMATION]).toEqual([
                        PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH
                    ]);
                })
            })
        })

        describe('loginFormDataSchema', () => {
            describe('valid login form data: ', () => {
                it('passes when all(email and password) fields are valid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'test@example.com',
                        [FIELDS.PASSWORD]: 'Password1!'
                    };

                    const res = loginFormDataSchema.safeParse(data);

                    assertSafeParseSuccess(res);
                    expect(res.data).toEqual(data);
                })
            })

            describe('invalid login form data: ', () => {
                it('fails when email field is invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'invalid',
                        [FIELDS.PASSWORD]: 'Password1!'
                    };

                    const res = loginFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.EMAIL]).toEqual([
                        EMAIL_ERROR_CODES.INVALID_FORMAT
                    ]);
                })

                it('fails when password field is invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'test@example.com',
                        [FIELDS.PASSWORD]: 'weak'
                    };

                    const res = loginFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD]).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                });

                it('fails when all(email and password) fields are invalid.', () => {
                    const data = {
                        [FIELDS.EMAIL]: 'invalid',
                        [FIELDS.PASSWORD]: 'weak'
                    };

                    const res = loginFormDataSchema.safeParse(data);

                    assertSafeParseError(res);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.EMAIL]).toEqual([
                        EMAIL_ERROR_CODES.INVALID_FORMAT
                    ]);
                    expect(z.flattenError(res.error).fieldErrors[FIELDS.PASSWORD]).toEqual([
                        PASSWORD_ERROR_CODES.TOO_SHORT,
                        PASSWORD_ERROR_CODES.MISSING_UPPERCASE,
                        PASSWORD_ERROR_CODES.MISSING_NUMBER,
                        PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR
                    ]);
                });
            })
        })
    })
})