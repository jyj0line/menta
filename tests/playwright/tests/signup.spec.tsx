import { test, expect, type Page } from '@playwright/test';
import {
  type SuccessT, successT, isSuccessT, assertSuccessT,
  type ErrorT, errorT,
  assertDefined,
  createSpedUrl, pollUntil,
  KEYS
} from '@/tests/utils/helper';
import { TEST_APIS, MOCKS, createMockEmail } from '@/tests/utils/mock';

import { GUEST_ROUTES } from '@/utils/constants/routes/guest.route';
import { ORIGINS, DEFAULT_PUBLIC_ROUTES } from '@/utils/constants/routes/public.route';
import { PROTECTED_ROUTES } from '@/utils/constants/routes/protected.route';
import { SP_KEYS } from '@/utils/constants/sp';
import { assert } from 'console';

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

type GetMessageIdsSuccessT = SuccessT<string[]>
type GetMessageIdsErrorT = ErrorT;
type GetMessageIdsTesult = GetMessageIdsSuccessT | GetMessageIdsErrorT;
const getMessageIdsRetFallback: GetMessageIdsErrorT = errorT('getMessageIdsRetFallback');

type GetMessageHtmlSuccessT = SuccessT<string>;
type GetMessageHtmlErrorT = ErrorT;
type GetMessageHtmlTesult = GetMessageHtmlSuccessT | GetMessageHtmlErrorT;
const getMessageHtmlRetFallback: GetMessageHtmlErrorT = errorT('getMessageHtmlRetFallback');

type ExtractLinkSuccessT = SuccessT<string>;
type ExtractLinkErrorT = ErrorT;
type ExtractLinkTesult = ExtractLinkSuccessT | ExtractLinkErrorT;
const extractLinkRetFallback: ExtractLinkErrorT = errorT('extractLinkRetFallback');

type DeleteMessagesSuccessT = SuccessT<null>;
type DeleteMessagesErrorT = ErrorT;
type DeleteMessagesTesult = DeleteMessagesSuccessT | DeleteMessagesErrorT;
const deleteMessagesRetFallback: DeleteMessagesErrorT = errorT('deleteMessagesRetFallback');

const mailpit = {
  async getMessageIds(toAddress: string, timeout: number, interval: number): Promise<GetMessageIdsTesult> {
    return pollUntil<GetMessageIdsSuccessT, GetMessageIdsErrorT>(
      async () => {
        const res = await fetch(MAILPIT_MESSAGES_API, {
          headers: { accept: "application/json" },
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) return getMessageIdsRetFallback;

        const data: MessagesRes = await res.json();
        return successT(
          data.messages
            .filter((m) => m.To.some((t) => t.Address === toAddress))
            .map((m) => m.ID)
        );
      },{
        checkFnRet: (tesult) => isSuccessT(tesult),
        timeout: timeout,
        interval: interval,
        fallback: getMessageIdsRetFallback
      }
    );
  },

  async getMessageHtml(messageId: string, timeout: number, interval: number): Promise<GetMessageHtmlTesult > {
    return pollUntil<GetMessageHtmlSuccessT, GetMessageHtmlErrorT>(
      async () => {
        const res = await fetch(createMailpitMessageApi(messageId), {
          headers: {
            accept: "application/json",
          },
          method: "GET",
          cache: "no-store"
        });
        if (!res.ok) return getMessageHtmlRetFallback;

        const data: MessageidRes = await res.json();
        return successT(data.HTML);
      }, {
        checkFnRet: (tesult) => isSuccessT(tesult),
        timeout: timeout,
        interval: interval,
        fallback: getMessageHtmlRetFallback
      }
    );
  },

  extractLink(messageHTML: string): ExtractLinkTesult {
    const link = messageHTML.match(EMAIL_VERIFICATION_LINK_MATCHER)?.[1];
    if (!link) return extractLinkRetFallback;
    return successT(link.replace(/&amp;/g, '&'));
  },

  async deleteMessages(ids: string[]): Promise<DeleteMessagesTesult> {
    const res = await fetch(MAILPIT_MESSAGES_API, {
      headers: {
        accept: "application/json",
      },
      method: 'DELETE',
      body: JSON.stringify({
        "IDs": ids
      })
    });
    if (!res.ok) return deleteMessagesRetFallback;
    return successT(null);
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
  signupPage: async ({ page }, runFixture) => {
    const po = new SignupPage(page);
    await po.gotoSignup();
    await runFixture(po);
  },

  freshSignupPage: async ({ browser }, runFixture) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const po = new SignupPage(page);
    await po.gotoSignup();
    await runFixture(po);
    await context.close();
  },

  mockEmail: async ({}, runFixture) => {
    await runFixture(createMockEmail());
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
  const idsTesult = await mailpit.getMessageIds(email, TIMEOUT, INTERVAL);
  assertSuccessT(idsTesult);
  expect(idsTesult[KEYS.DATA].length).toBe(1);

  const id = idsTesult[KEYS.DATA][0];
  assertDefined(id);
  const htmlTesult = await mailpit.getMessageHtml(id, TIMEOUT, INTERVAL);
  assertSuccessT(htmlTesult);
  const html = htmlTesult[KEYS.DATA];

  const linkTesult = mailpit.extractLink(html);
  assertSuccessT(linkTesult);
  const link = linkTesult[KEYS.DATA];

  return link;
};

// delete emails sented to the user
const expectDeleteMessages = async (toAddress: string) => {
  const idsTesult = await mailpit.getMessageIds(toAddress, TIMEOUT, INTERVAL);
  assertSuccessT(idsTesult);
  const deleteTesult = await mailpit.deleteMessages(idsTesult[KEYS.DATA]);
  assertSuccessT(deleteTesult);
}
// -Helper

// Test-
signupTest.describe('/signup: ', () => {
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
        
        // delete emails sented to the user
        await expectDeleteMessages(mockEmail);

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

        // delete emails sented to the user
        await expectDeleteMessages(mockEmail);

        // duplicate sign up -> success UI
        await expectSignupSuccess(freshSignupPage, mockEmail, MOCKS.PASSWORD);

        // but NO new email is sent
        const idsTesult = await mailpit.getMessageIds(mockEmail, TIMEOUT, INTERVAL);
        assertSuccessT(idsTesult);
        expect(idsTesult[KEYS.DATA].length).toBe(0);
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