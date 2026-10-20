# Demoblaze Automation Framework

A test automation framework for [Demoblaze](https://www.demoblaze.com/) built with **TypeScript, Playwright, and k6**. The framework supports UI functional testing, API functional testing, performance testing, and CI/CD integration with GitHub Actions.

## 1. Technology Stack

| Technology | Purpose |
|---|---|
| TypeScript | Type-safe automation code |
| Playwright Test | UI and API functional testing |
| Page Object Model (POM) | Organizes reusable UI page interactions |
| k6 | Performance testing, including load and stress testing |
| dotenv | Loads local test configuration and environment variables |
| GitHub Actions | CI/CD automation |
| Playwright HTML Reporter | UI and API test result reporting |

## 2. Framework Structure

```text
demoblaze-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── ui/
│   └── pages/
│       ├── LoginPage.ts
│       └── CartPage.ts
├── src/
│   └── fixtures/
│       └── testFixtures.ts
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts
│   │   └── cart.spec.ts
│   └── api/
│       └── login.spec.ts
├── performance/
│   └── login-load.js
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── test-data.env
├── .env.example
├── .gitignore
└── README.md
```

*The tree above is illustrative; keep the actual filenames and paths used in the repository.*

### Design rationale

- **`ui/pages/`** — contains Page Object classes that encapsulate UI locators and reusable page interactions.
- **`src/fixtures/`** — contains shared fixtures and test setup.
- **`tests/ui/`** — contains UI functional tests for features such as login and cart.
- **`tests/api/`** — contains API functional tests that validate status codes, response bodies, required fields, and application behavior.
- **`performance/`** — contains k6 scripts dedicated exclusively to performance testing. These scripts run independently of Playwright Test.
- **`playwright.config.ts`** — configures Playwright test discovery, browser projects, API project settings, and reporting.
- **`tsconfig.json`** — configures TypeScript type checking and compilation.
- **`test-data.env`** — stores local test configuration and credentials.
- **`.env.example`** — documents required environment variables without exposing real credentials.
- **`.github/workflows/`** — contains GitHub Actions workflows for CI/CD.

Separating functional and performance testing allows each suite to be executed, configured, and maintained independently.

## 3. Prerequisites

Install:

- [Node.js](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) — only required for performance testing

## 4. Clone and Install

```bash
git clone https://github.com/camthinguyen/demoblaze-automation.git
cd demoblaze-automation

npm ci
npx playwright install
```

Install k6 separately if you intend to run performance tests.

## 5. Configure Test Data

From https://www.demoblaze.com/index.html, sign up a new account.

Create `test-data.env` in the project root with your tests account.

```dotenv
TEST_USERNAME=your_test_username
TEST_PASSWORD=your_test_password
```

Keep real credentials out of version control. Add `test-data.env` to `.gitignore` and commit `.env.example` instead.

## 6. Execute UI Functional Tests

Run demo tests:

```bash
npx playwright test --grep @demo
```

Run smoke tests:

```bash
npx playwright test --grep @smoke
```

Run regression tests:

```bash
npx playwright test --grep @regression
```

Run demo tests in Chromium:

```bash
npx playwright test --grep @demo --project=chromium
```

These commands assume the corresponding tags and browser project are configured.

## 7. Execute API Functional Tests

Run all tests in the API project:

```bash
npx playwright test --project=api
```

Run the login API test specifically:

```bash
npx playwright test tests/api/login.spec.ts
```

Playwright API tests validate functional behavior, including HTTP responses and application-level results. They are separate from k6 performance tests.

## 8. Execute Performance Tests with k6

Run the login performance test:

```bash
k6 run performance/login-load.js
```

Configure any required credentials and endpoint according to the script. Before running a load test, verify the request payload, authentication behavior, workload, and performance thresholds.

**Important:** Run high-volume load, stress, spike, and endurance tests only against systems you are authorized to test. Do not load-test the public Demoblaze service without permission.

## 9. Test Reports

Open the Playwright HTML report if reporting is configured:

```bash
npx playwright show-report
```

Playwright reports UI and API functional test results. k6 provides separate performance metrics such as request duration, failure rate, and throughput.

## 10. CI/CD Integration

GitHub Actions can automate functional test execution on pushes, pull requests, or manual triggers.

The workflow can:

1. Check out the repository.
2. Set up Node.js.
3. Install dependencies and Playwright browsers.
4. Run UI and API functional tests.
5. Upload test reports and debugging artifacts.

Performance tests should run through a separate, controlled workflow or job, with appropriate environment protection and credentials.

## 11. Future Improvements

- Expand UI, API and performance regression coverage.
- Improve test data isolation.
- Run UI and API regression tests automatically on a daily or weekly schedule.

## 12. Disclaimer

This project is intended for learning, demonstration, and authorized testing. 
