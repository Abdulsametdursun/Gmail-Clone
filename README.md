Gmail Clone

A fully functional Gmail clone built with React, Redux Toolkit, and Firebase, styled with Material
UI. 🔧 Features

    Compose, send, and read emails

    Firebase for real-time backend and authentication

    Material UI for sleek, responsive design

    Redux Toolkit for efficient state management

    Email form validation with react-hook-form

🚀 Tech Stack

    React

    Redux Toolkit

    Firebase

    Material UI

    React Hook Form

📦 Installation

Clone the repo and install dependencies:

git clone https://github.com/Abdulsametdursun/Gmail-Clone cd gmail-clone yarn install

🛠 Available Scripts

yarn start # Run the app in development yarn build # Create a production build yarn test # Run tests
yarn eject # Eject the configuration (use with caution)

🔐 Firebase Setup

    Create a Firebase project at firebase.google.com

    Replace the config in firebase.js with your own Firebase credentials.

    Enable Firestore and Authentication (with Email/Password).

🧪 Testing

The app uses @testing-library/react for component testing. Run:

yarn test

📁 Project Structure

/src /app # Redux store /components # UI Components (Header, Sidebar, EmailRow, etc.) /features #
Redux slices (mail, user) firebase.js # Firebase config

🧹 Code Quality

    ESLint and Prettier are configured

    Follows modern React best practices with functional components and hooks

📄 License

MIT License
