# QA Test Case Manager

A portfolio-ready React application for creating, managing, executing and exporting software test cases.

## Features

- Create and edit structured test cases
- Test case IDs such as `TC-001`
- Module, preconditions, test steps, expected and actual results
- Status: Not Run, Pass, Fail, Blocked
- Priority and severity tracking
- Search and filtering
- Dashboard counters
- Delete individual cases or clear all
- CSV export
- Responsive layout
- Browser localStorage persistence
- Demo test cases for first launch

## Tech Stack

- React 18
- Vite
- JavaScript
- CSS
- Browser localStorage

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

For a production build:

```bash
npm run build
npm run preview
```

## QA Portfolio Value

This project demonstrates practical QA concepts including test case design, functional test execution, status tracking, severity/priority classification, regression-oriented organization and test-result reporting.

## Data

The application does not use a backend or external database. Test cases are stored in the browser's localStorage. The included records are clearly demo records and can be deleted.

## Future Improvements

- Backend API and database
- Authentication and role-based access
- Test suites and test runs
- Evidence/screenshot attachments
- Defect linking
- Excel export
- PDF reports
- Playwright integration
- REST API integration
