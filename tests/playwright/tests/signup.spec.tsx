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

const NEXT_PATH = PROTECTED_ROUTES.MY;
const NEXT_URL = `${ORIGINS.NEXTJS}${NEXT_PATH}`;
const SIGNUP_URL_WITH_NEXT = createSpedUrl(
  `${ORIGINS.NEXTJS}${GUEST_ROUTES.SIGN_UP}`,
  { [SP_KEYS.NEXT]: NEXT_PATH }
);

const CHECK_EMAIL_MESSAGE = /Please check your email./;

const EMAIL_VERIFICATION_LINK_MATCHER = /href="([^"]*auth\/confirm[^"]*)"/;

const TIMEOUT = 20_000;
const INTERVAL = 500;
const GRACE = 5_000; 

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

type MessageRes = {
  HTML: string;
};

type GetMessageIdsSuccessT = SuccessT<string[]>
type GetMessageIdsErrorT = ErrorT;
type GetMessageIdsTesult = GetMessageIdsSuccessT | GetMessageIdsErrorT;
const getMessageIdsFallbackErrorT: GetMessageIdsErrorT = errorT('getMessageIdsRetFallback');

type GetMessageHtmlSuccessT = SuccessT<string>;
type GetMessageHtmlErrorT = ErrorT;
type GetMessageHtmlTesult = GetMessageHtmlSuccessT | GetMessageHtmlErrorT;
const getMessageHtmlRetFallbackErrorT: GetMessageHtmlErrorT = errorT('getMessageHtmlRetFallback');

type ExtractLinkSuccessT = SuccessT<string>;
type ExtractLinkErrorT = ErrorT;
type ExtractLinkTesult = ExtractLinkSuccessT | ExtractLinkErrorT;
const extractLinkFallbackErrorT: ExtractLinkErrorT = errorT('extractLinkRetFallback');

type DeleteMessagesSuccessT = SuccessT<null>;
type DeleteMessagesErrorT = ErrorT;
type DeleteMessagesTesult = DeleteMessagesSuccessT | DeleteMessagesErrorT;
const deleteMessagesFallbackErrorT: DeleteMessagesErrorT = errorT('deleteMessagesRetFallback');

const mailpit = {
  async getMessageIds(toAddress: string): Promise<GetMessageIdsTesult> {
    const res = await fetch(MAILPIT_MESSAGES_API, {
      headers: { accept: "application/json" },
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return getMessageIdsFallbackErrorT;

    const data: MessagesRes = await res.json();
    return successT(
      data.messages
        .filter((m) => m.To.some((t) => t.Address === toAddress))
        .map((m) => m.ID)
    );
  },

  async waitMessageIds(
    toAddress: string,
    opts: {
      timeout: number;
      interval: number;
      waitUntilCount: number;
    }
  ): Promise<GetMessageIdsTesult> {
    return pollUntil<GetMessageIdsSuccessT, GetMessageIdsErrorT>(
      async () => {
        const result = await this.getMessageIds(toAddress);
        if (isSuccessT(result) && result[KEYS.DATA].length == opts.waitUntilCount) return result;
        return getMessageIdsFallbackErrorT;
      },
      {
        checkFnRet: isSuccessT,
        timeout: opts.timeout,
        interval: opts.interval,
        fallback: getMessageIdsFallbackErrorT,
      }
    );
  },

  async waitMessageHtml(
    messageId: string,
    opts: {
      timeout: number;
      interval: number;
    }
  ): Promise<GetMessageHtmlTesult > {
    return pollUntil<GetMessageHtmlSuccessT, GetMessageHtmlErrorT>(
      async () => {
        const res = await fetch(createMailpitMessageApi(messageId), {
          headers: {
            accept: "application/json",
          },
          method: "GET",
          cache: "no-store"
        });
        if (!res.ok) return getMessageHtmlRetFallbackErrorT;

        const data: MessageRes = await res.json();
        return successT(data.HTML);
      }, {
        checkFnRet: (tesult) => isSuccessT(tesult),
        timeout: opts.timeout,
        interval: opts.interval,
        fallback: getMessageHtmlRetFallbackErrorT
      }
    );
  },

  extractLink(messageHTML: string): ExtractLinkTesult {
    const link = messageHTML.match(EMAIL_VERIFICATION_LINK_MATCHER)?.[1];
    if (!link) return extractLinkFallbackErrorT;
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
    if (!res.ok) return deleteMessagesFallbackErrorT;
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
};

// get email verification link
const expectLink = async (
  toAddress: string, waitUntilCount: number
): Promise<string> => {
  const idsTesult = await mailpit.waitMessageIds(
    toAddress,
    {
      timeout: TIMEOUT,
      interval: INTERVAL,
      waitUntilCount: waitUntilCount
    }
  );
  assertSuccessT(idsTesult);
  expect(idsTesult[KEYS.DATA].length).toBe(waitUntilCount);

  const id = idsTesult[KEYS.DATA][0];
  assertDefined(id);
  const htmlTesult = await mailpit.waitMessageHtml(
    id,
    {
      timeout: TIMEOUT,
      interval: INTERVAL
    }
  );
  assertSuccessT(htmlTesult);
  const html = htmlTesult[KEYS.DATA];

  const linkTesult = mailpit.extractLink(html);
  assertSuccessT(linkTesult);
  const link = linkTesult[KEYS.DATA];

  return link;
};

// delete emails sented to the user
const expectDeleteMessages = async (toAddress: string, waitUntilCount: number) => {
  const idsTesult = await mailpit.waitMessageIds(
    toAddress,
    {
      timeout: TIMEOUT,
      interval: INTERVAL,
      waitUntilCount: waitUntilCount
    }
  );
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
        const link = await expectLink(mockEmail, 1);

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
        await expectDeleteMessages(mockEmail, 1);

        // duplicate sign up with unverified email -> success UI
        await signupPage.gotoSignup();
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail, 1);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });
      },
    );
  });

  signupTest.describe('uncomplete signup success:', () => {
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
      'duplicate sign up already successed with verified email(but no second verification email): ',
      async ({ signupPage, freshSignupPage, mockEmail }) => {
        // sign up -> success UI
        await expectSignupSuccess(signupPage, mockEmail, MOCKS.PASSWORD);
        const link = await expectLink(mockEmail, 1);

        // email verification
        await signupPage.page.goto(link);

        // redirected to the next path(by next sp value)
        await expect(signupPage.page).toHaveURL(NEXT_URL, {
          timeout: TIMEOUT
        });

        // delete emails sented to the user
        await expectDeleteMessages(mockEmail, 1);

        // duplicate sign up -> success UI
        await expectSignupSuccess(freshSignupPage, mockEmail, MOCKS.PASSWORD);

        // but NO new email is sent 
        await new Promise((r) => setTimeout(r, GRACE));
        const idsTesult = await mailpit.getMessageIds(mockEmail);
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
        const link = await expectLink(mockEmail, 1);

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