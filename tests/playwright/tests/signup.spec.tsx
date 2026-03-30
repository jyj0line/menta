import { test, expect, type Page } from '@playwright/test';
import { assertNotNull, createSpedUrl, pollUntil } from '@/tests/utils/helper';
import { TEST_APIS, MOCKS, createMockEmail } from '@/tests/utils/mock';

import { GUEST_ROUTES } from '@/utils/constants/routes/guest.route';
import { ORIGINS, DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { SP_KEYS } from '@/utils/constants/sp';

const NEXT_PATH = PROTECTED_ROUTES.MY;
const NEXT_URL = `${ORIGINS.NEXTJS}${NEXT_PATH}`;
const SIGNUP_URL_WITH_NEXT = createSpedUrl(
  `${ORIGINS.NEXTJS}${GUEST_ROUTES.SIGN_UP}`,
  { [SP_KEYS.NEXT]: NEXT_PATH }
);

const CHECK_EMAIL_MESSAGE = /Please check your email./;

const EMAIL_VERIFICATION_LINK_MATCHER = /href="([^"]*auth\/confirm[^"]*)"/;

const TIMEOUT = 10_000;
const INTERVAL = 500;

// Mailpit-
const MAILPIT_MESSAGES_API = `${TEST_APIS.SUPABASE_DT_MAILPIT}/api/v1/messages`;
const createMailpitMessageApi = (messageId: string) => {
  return `${TEST_APIS.SUPABASE_DT_MAILPIT}/api/v1/message/${messageId}`;
}

type MessagesRes = {
  messages: {
    ID: string
    To: { Address: string }[]
  }[]
};
type MessageidRes = {
  HTML: string;
};

type GetMessageIdRet = string | null;
type GetMessageHtmlRet = string | null;
const mailpit = {
  async getMessageId(toAddress: string, timeout: number, interval: number): Promise<GetMessageIdRet> {
    return pollUntil<GetMessageIdRet, Extract<GetMessageIdRet, null>>(
      async () => {
        const res = await fetch(MAILPIT_MESSAGES_API, {
          headers: { accept: "application/json" },
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) return null;

        const data: MessagesRes = await res.json();
        return data.messages.find((m) =>
          m.To.some((t) => t.Address === toAddress)
        )?.ID ?? null;
      },{
        checkFnRet: (id) => id !== null,
        timeout: timeout,
        interval: interval,
        fallback: null
      }
    );
  },

  async getMessageHtml(messageId: string, timeout: number, interval: number): Promise<GetMessageHtmlRet > {
    return pollUntil<GetMessageHtmlRet, Extract<GetMessageHtmlRet, null>>(
      async () => {
        const res = await fetch(createMailpitMessageApi(messageId), {
          headers: {
            accept: "application/json",
          },
          method: "GET",
          cache: "no-store"
        });
        if (!res.ok) return null;

        const data: MessageidRes = await res.json();
        return data.HTML;
      }, {
        checkFnRet: (html) => html !== null,
        timeout: timeout,
        interval: interval,
        fallback: null
      }
    );
  },

  extractLink(messageHTML: string): string | null {
    const link = messageHTML.match(EMAIL_VERIFICATION_LINK_MATCHER)?.[1];
    if (!link) return null;
    return link.replace(/&amp;/g, '&');
  },

  async deleteMessages(): Promise<void> {
    await fetch(MAILPIT_MESSAGES_API, {
      headers: {
        accept: "application/json",
      },
      method: 'DELETE'
    });
  },
};
// -Mailpit

// Page Object Model-
class SignupPage {
  constructor(readonly page: Page) {}

  // Navigation-
  async gotoSignup() {
    await this.page.goto(SIGNUP_URL_WITH_NEXT);
  }
  // -Navigation

  // Locators-
  get emailInput()  { return this.page.getByLabel(/^Email$/); }
  get passwordInput() { return this.page.getByLabel(/^Password$/); }
  get pwcInput()  { return this.page.getByLabel(/^Confirm Password$/); }
  get submitButton()  { return this.page.getByRole('button', { name: /^Sign Up$/ }); }
  // -Locators

  // Actions-
  async signup(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.pwcInput.fill(password);
    await this.submitButton.click();
  }
  // -Actions
}
// -Page Object Model

// Fixture-
interface SignupFixture {
  signupPage: SignupPage;
  freshSignupPage: SignupPage;
  mockEmail: string;
}
const signupTest = test.extend<SignupFixture>({
  signupPage: async ({ page }, use) => {
    const po = new SignupPage(page);
    await po.gotoSignup();
    await use(po);
  },

  freshSignupPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const po = new SignupPage(page);
    await po.gotoSignup();
    await use(po);
    await context.close();
  },

  mockEmail: async ({}, use) => {
    await use(createMockEmail());
  },
});
// -Fixture

// Helper-
// sign up -> success UI
const expectSignupSuccess = async (
  signupPage: SignupPage,
  email: string,
  password: string
): Promise<void> => {
  await signupPage.signup(email, password);
  await expect(signupPage.page.getByText(CHECK_EMAIL_MESSAGE)).toBeVisible();
  await expect(signupPage.page.getByText(email)).toBeVisible();
  await expect(signupPage.emailInput).not.toBeVisible();
  await expect(signupPage.passwordInput).not.toBeVisible();
  await expect(signupPage.pwcInput).not.toBeVisible();
  await expect(signupPage.submitButton).not.toBeVisible();
};
// get email verification link
const expectLink = async (
  email: string
): Promise<string> => {
  const messageId = await mailpit.getMessageId(email, TIMEOUT, INTERVAL);
  assertNotNull(messageId, 'messageId is null');
  const messageHTML = await mailpit.getMessageHtml(messageId, TIMEOUT, INTERVAL);
  assertNotNull(messageHTML, 'messageHTML is null');
  const link = mailpit.extractLink(messageHTML);
  assertNotNull(link, 'link is null');
  return link;
};
// -Helper

// Test-
signupTest.describe('/signup: ', () => {
  signupTest.beforeEach(async () => {
    await mailpit.deleteMessages();
  });

  signupTest.describe('signup success: ', () => {
    signupTest(
      'sign up success: ',
      async ({ signupPage, mockEmail }) => {
        // sign up -> success UI -> get email verification link
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });
      },
    );

    signupTest(
      'duplicate sign up success with unverified email: ',
      async ({ signupPage, mockEmail }) => {
        // sign up -> success UI
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        
        // delete the first email
        await mailpit.deleteMessages();

        // duplicate sign up with unverified email -> success UI
        await signupPage.gotoSignup();
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });
      },
    );
  });

  signupTest.describe('signup failure:', () => {
    signupTest(
      'sign up partial success without email verification: ',
      async ({ signupPage, mockEmail }) => {
        // sign up -> success UI
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);

        // cannot access protected route and redirected to the login path(∵ no email verification)
        await signupPage.page.goto(PROTECTED_ROUTES.MY);
        await expect(signupPage.page).toHaveURL(
          createSpedUrl(`${ORIGINS.NEXTJS}${GUEST_ROUTES.LOGIN}`, { [SP_KEYS.NEXT]: PROTECTED_ROUTES.MY }),
          { timeout: TIMEOUT }
        );
      }
    );

    signupTest(
      'duplicate sign up success with verified email(but no second verification email): ',
      async ({ signupPage, freshSignupPage, mockEmail }) => {
        // sign up -> success UI
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });

        // delete the first email
        await mailpit.deleteMessages();

        // duplicate sign up -> success UI
        await expectSignupSuccess(freshSignupPage, mockEmail, MOCKS.PASSWORD);

        // but NO new email is sent
        const messageId = await mailpit.getMessageId(mockEmail, TIMEOUT, INTERVAL);
        expect(messageId).toBeNull();
      },
    );

  });

  signupTest.describe('navigation:', () => {
    signupTest(
      'click logo and navigated to /',
      async ({ signupPage }) => {
        const logo = signupPage.page.getByRole('link', { name: 'Menta Logo' });
        await logo.click();

        await expect(signupPage.page).toHaveURL(`${ORIGINS.NEXTJS}/`, {
          timeout: TIMEOUT,
        });
      },
    );
  });

  signupTest.describe('access control:', () => {
    signupTest(
      'logged in user cannot access signup page',
      async ({ signupPage, mockEmail, page }) => {
        // sign up -> success UI
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });

        // go to signup page
        await page.goto(`${ORIGINS.NEXTJS}${GUEST_ROUTES.SIGN_UP}`);

        // redirected to the default public next path
        await expect(page).toHaveURL(`${ORIGINS.NEXTJS}${DEFAULT_PUBLIC_ROUTES.NEXT}`, { timeout: TIMEOUT });
    });
  });
});