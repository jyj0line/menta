"use client";

import { useState, useActionState, useEffect } from 'react';
import * as z from 'zod';
import { useTranslations } from 'next-intl';

import { signupAction } from '@/features/auth/auth.action';
import {
    EMAIL_FIELD,
    PASSWORD_FIELD, PASSWORD_CONFIRMATION_FIELD
} from '@/features/auth/constants/auth.field';
import { type SignupFormData, signupFormDataSchema } from '@/features/auth/auth.schema';;
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/features/auth/constants/auth.length';
import {
    type EmailErrorCode, EMAIL_ERROR_CODES,
    type PasswordErrorCode, PASSWORD_ERROR_CODES,
    type PasswordConfirmationErrorCode, PASSWORD_CONFIRMAITON_ERROR_CODES
} from '@/features/auth/results/auth.validationER.result';

import { Candy } from '@/components/atoms/Candy';
import { Button, Toggle, Link } from '@/components/atoms/Click';
import { Input } from '@/components/atoms/Input';
import { VisibilityOnSVG, VisibilityOffSVG } from '@/components/svgs/svgs';

import { KEYS } from '@/results/result.result';
import { isSuccessR } from '@/results/successR/successR.result';
import { isUnexpectedER } from '@/results/errorR/unexpectedER.result';
import { type FieldErrorCodes, isValidationER } from '@/results/errorR/validationER.result';
import { INPUT } from "@/utils/constants/length";

const INPUT_CONTAINER_BASE_CN = 'flex flex-row items-center h-inp pl-inp-x rounded-inp border border-(--ln-click) focus-within:outline focus-within:outline-(--ln-click)';
const INPUT_CONTAINER_DEFAULT_CN = 'border-ln-sub focus-within:outline-ln-sub';
const INPUT_CONTAINER_ERROR_CN = 'border-ln-dng focus-within:outline-ln-dng';

const INPUT_CN = 'grow-1 h-full placeholder:text-txt-sub';

const DESC_BASE_CN = 'ut-txt-sub';
const DESC_DEFAULT_CN = 'text-txt-sub';
const DESC_ERROR_CN = 'text-txt-dng';

const VISIBILITY_SVG_CN = 'w-auto h-full p-quarter aspect-auto fill-svg-dft';
const VisibilitySVG = ({ isShown}: { isShown: boolean }) => (
    isShown ? 
    <VisibilityOnSVG className={VISIBILITY_SVG_CN} />
    : <VisibilityOffSVG className={VISIBILITY_SVG_CN} />
);

const FILED_ERROR_CODE_POSTFIX = ' message';
type FieldErrorMessagesPProps = {
    idPrefix: string;
    errorMessages: Record<string, string>;
    errorCodes?: string[];
};
const FieldErrorCodesP = ({
    idPrefix,
    errorMessages,
    errorCodes
}: FieldErrorMessagesPProps) => (
    <div id={`${idPrefix}${FILED_ERROR_CODE_POSTFIX}`} className='flex flex-col'>
        {Object.entries(errorMessages).map(([key, desc]) => {
            const isInErrorCodes = errorCodes?.includes(key);
            return (
                <p
                    key={key}
                    className={`${DESC_BASE_CN} ${isInErrorCodes ? DESC_ERROR_CN : DESC_DEFAULT_CN}`}
                >
                    - {desc}
                </p>
            );
        })}
    </div>
);

type SignUpFormProps = {
    next: string;
    className?: string;
};
export const SignUpForm = ({ next, className }: SignUpFormProps) => {
    const [signupState, formAction, isPending] = useActionState(
        signupAction.bind(null, next),
        undefined
    );
    
    // field values
    const [formData, setFormData] = useState<SignupFormData>({
        [EMAIL_FIELD]: '',
        [PASSWORD_FIELD]: '',
        [PASSWORD_CONFIRMATION_FIELD]: ''
    });

    // field error codes(validationER)
    const [fieldErrorCodes, setFieldErrorCodes] = useState<FieldErrorCodes<SignupFormData>>({});

    // password visibilities
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [isPasswordConfirmationShown, setIsPasswordConfirmationShown] = useState<boolean>(false);

    // handling signupState
    useEffect(() => {
        if (signupState === undefined) {
        } else if (isSuccessR(signupState)) {
            setFieldErrorCodes({});
        } else if (isValidationER<SignupFormData>(signupState)) {
            setFieldErrorCodes(signupState[KEYS.FIELD_ERROR_CODES]);
        } else if (isUnexpectedER(signupState)) {
            // todo
        } 
    }, [signupState]);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name: field, value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldBlur = (field: keyof SignupFormData) => {
        const res = signupFormDataSchema.safeParse(formData);
        const newFieldErrorCodes = res.success ? {} : z.flattenError(res.error).fieldErrors;

        setFieldErrorCodes(prev => {
            const next = {
                ...prev,
                [field]: newFieldErrorCodes[field]
            };

            if (field === PASSWORD_FIELD && formData[PASSWORD_CONFIRMATION_FIELD]) {
                next[PASSWORD_CONFIRMATION_FIELD] = newFieldErrorCodes[PASSWORD_CONFIRMATION_FIELD];
            }

            return next;
        });
    };



    const hasEmailError = (fieldErrorCodes[EMAIL_FIELD]?.length ?? 0) > 0;
    const hasPasswordError = (fieldErrorCodes[PASSWORD_FIELD]?.length ?? 0) > 0;
    const hasPasswordConfirmationError = (fieldErrorCodes[PASSWORD_CONFIRMATION_FIELD]?.length ?? 0) > 0;

    const isAllFieldsFilled = formData[EMAIL_FIELD] && formData[PASSWORD_FIELD] && formData[PASSWORD_CONFIRMATION_FIELD];
    const canSubmit = isAllFieldsFilled
        && !hasEmailError && !hasPasswordError && !hasPasswordConfirmationError
        && !isPending;


        
    const metadataT = useTranslations('metadata');
    const formT = useTranslations('auth.component.signup.form');
    const successT = useTranslations('auth.component.signup.success');

    const emailT = useTranslations('auth.result.fieldErrorCodeMessages.email');
    const emailTs: Record<EmailErrorCode, string> = {
        [EMAIL_ERROR_CODES.INVALID_FORMAT]: emailT(EMAIL_ERROR_CODES.INVALID_FORMAT),
    }

    const pwT = useTranslations('auth.result.fieldErrorCodeMessages.password')
    const pwTs: Record<PasswordErrorCode, string> = {
        [PASSWORD_ERROR_CODES.TOO_SHORT]: pwT(PASSWORD_ERROR_CODES.TOO_SHORT, { min: PASSWORD_MIN_LENGTH.toString() }),
        [PASSWORD_ERROR_CODES.TOO_LONG]: pwT(PASSWORD_ERROR_CODES.TOO_LONG, { max: PASSWORD_MAX_LENGTH.toString() }),
        [PASSWORD_ERROR_CODES.MISSING_LOWERCASE]: pwT(PASSWORD_ERROR_CODES.MISSING_LOWERCASE),
        [PASSWORD_ERROR_CODES.MISSING_UPPERCASE]: pwT(PASSWORD_ERROR_CODES.MISSING_UPPERCASE),
        [PASSWORD_ERROR_CODES.MISSING_NUMBER]: pwT(PASSWORD_ERROR_CODES.MISSING_NUMBER),
        [PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR]: pwT(PASSWORD_ERROR_CODES.MISSING_SPECIAL_CHAR),
    }

    const pwcT = useTranslations('auth.result.fieldErrorCodeMessages.password_confirmation');
    const pwcTs: Record<PasswordConfirmationErrorCode, string> = {
        [PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH]: pwcT(PASSWORD_CONFIRMAITON_ERROR_CODES.MISMATCH),
    }

    if (signupState !== undefined && isSuccessR(signupState)) {
        return (
            <Candy
                title={successT('candy.title')}
                warning={successT('candy.warning')}
                details={successT('candy.details', { email: formData[EMAIL_FIELD] })}
                className={`border-ln-sub ${className}`}
            />
        );
    }

    return (
        <form action={formAction} className={`flex flex-col ${className}`}>
            {/* email field */}
            <div className='flex flex-col'>
                <label htmlFor={EMAIL_FIELD}>
                    {formT('emailLabel')}
                </label>

                <div className={`${INPUT_CONTAINER_BASE_CN}
                    ${hasEmailError ? INPUT_CONTAINER_ERROR_CN : INPUT_CONTAINER_DEFAULT_CN}`}
                >
                    <Input
                        idName={EMAIL_FIELD}
                        ariaDescribedby={`${EMAIL_FIELD}${FILED_ERROR_CODE_POSTFIX}`}
                        type="email"
                        placeholder={formT('emailPlaceholder')}
                        maxLength={INPUT.MAX}
                        value={formData[EMAIL_FIELD]}
                        onChange={handleFieldChange}
                        onBlur={() => handleFieldBlur(EMAIL_FIELD)}
                        className={INPUT_CN}
                    />
                </div>

                <FieldErrorCodesP
                    idPrefix={EMAIL_FIELD}
                    errorMessages={emailTs}
                    errorCodes={fieldErrorCodes[EMAIL_FIELD]}
                />
            </div>
            
            {/* password field */}
            <div className='flex flex-col mt-(--spacing-48)'>
                <label htmlFor={PASSWORD_FIELD}>
                    {formT('passwordLabel')}
                </label>

                <div className={`${INPUT_CONTAINER_BASE_CN}
                    ${hasPasswordError ? INPUT_CONTAINER_ERROR_CN : INPUT_CONTAINER_DEFAULT_CN}`}
                >
                    <Input
                        idName={PASSWORD_FIELD}
                        ariaDescribedby={`${PASSWORD_FIELD}${FILED_ERROR_CODE_POSTFIX}`}
                        type={isPasswordShown ? "text" : "password"}
                        placeholder={formT('passwordPlaceholder')}
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={formData[PASSWORD_FIELD]}
                        onChange={handleFieldChange}
                        onBlur={() => handleFieldBlur(PASSWORD_FIELD)}
                        className={INPUT_CN}
                    />

                    <Toggle
                        ariaLabel={formT('showPasswordAriaLabel')}
                        ariaPressed={isPasswordShown}
                        tabIndex={-1}
                        onClick={ () => { setIsPasswordShown(prev => !prev) }}
                        className='h-full'
                    >
                        {VisibilitySVG({ isShown: isPasswordShown })}
                    </Toggle>
                </div>

                <FieldErrorCodesP
                    idPrefix={PASSWORD_FIELD}
                    errorMessages={pwTs}
                    errorCodes={fieldErrorCodes[PASSWORD_FIELD]}
                />
            </div>
            
            {/* password confirmation field */}
            <div className='flex flex-col mt-(--spacing-48)'>
                <label htmlFor={PASSWORD_CONFIRMATION_FIELD}>
                    {formT('passwordConfirmationLabel')}
                </label>

                <div className={`${INPUT_CONTAINER_BASE_CN}
                    ${hasPasswordConfirmationError ? INPUT_CONTAINER_ERROR_CN : INPUT_CONTAINER_DEFAULT_CN}`}
                >
                    <Input
                        idName={PASSWORD_CONFIRMATION_FIELD}
                        ariaDescribedby={`${PASSWORD_CONFIRMATION_FIELD}${FILED_ERROR_CODE_POSTFIX}`}
                        type={isPasswordConfirmationShown ? "text": "password"}
                        placeholder={formT('passwordConfirmationPlaceholder')}
                        maxLength={PASSWORD_MAX_LENGTH}
                        value={formData[PASSWORD_CONFIRMATION_FIELD]}
                        onChange={handleFieldChange}
                        onBlur={() => handleFieldBlur(PASSWORD_CONFIRMATION_FIELD)}
                        className={INPUT_CN}
                    />

                    <Toggle
                        ariaLabel={formT('showPasswordConfirmationAriaLabel')}
                        ariaPressed={isPasswordConfirmationShown}
                        tabIndex={-1}
                        onClick={() => { setIsPasswordConfirmationShown(prev => !prev) }}
                        className='h-full'
                    >
                        {VisibilitySVG({ isShown: isPasswordConfirmationShown })}
                    </Toggle>
                </div>

                <FieldErrorCodesP
                    idPrefix={PASSWORD_CONFIRMATION_FIELD}
                    errorMessages={pwcTs}
                    errorCodes={fieldErrorCodes[PASSWORD_CONFIRMATION_FIELD]}
                />
            </div>

            {/* sign up button */}
            <Button
                type="submit"
                label={formT('signupButtonLabel')}
                disabled={!canSubmit}
                tabIndex={-1}
                className='mt-btn-sbm'
            />
        </form>
    );
}