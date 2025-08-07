# NIE Appointment Bot

This is an automated bot written in JavaScript to check and search for available NIE appointments in Spain, using Playwright. 

It was created to simplify the process of checking appointments, which requires manually selecting province and procedure, entering personal information, and checking availability—making it unnecessarily time-consuming.

You can run this project locally or as a GitHub Action.

## Usage

You can run this project locally or as a GitHub Action.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Yarn](https://yarnpkg.com/) installed

### Local
1. Install dependencies:
    ```powershell
    yarn install
    yarn playwright install
    ```
2. Create a `.env` file with your data (**do not commit this file**):
    ```env
    PROVINCE=
    PASSPORT_ID=
    NAME=
    YEAR_OF_BIRTH=
    COUNTRY=
    ```
3. Run the bot:
    ```powershell
    yarn start
    ```

### GitHub Actions
1. Add your secrets in your GitHub repository settings (Settings > Secrets and variables > Actions).
2. Use the provided workflow file in `.github/workflows/check-appointment-status.yml`.
3. Trigger the workflow manually from the Actions tab.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.