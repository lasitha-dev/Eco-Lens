# Eco-Lens: The Sustainable Shopping Assistant 📱

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

Eco-Lens is a **mobile application** built with React Native and Expo, designed to empower ethically-conscious consumers. It provides instant, data-driven sustainability ratings on products, helping users make informed purchasing decisions that align with their values.

## ✨ Key Features

-   **Cross-Platform:** Runs on both iOS and Android from a single codebase.
-   **User Authentication:** Secure sign-up and login for a personalized experience.
-   **Product Search:** Easily search for products to view their sustainability score.
-   **Sustainability Ratings:** A clear, A-F rating system based on transparent criteria.
-   **Personalized Goals:** Set and track personal sustainability goals.

## 💻 Technology Stack

-   **Framework:** React Native
-   **Platform:** Expo
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **Version Control:** Git & GitHub

## 📂 Folder Structure
  

```
eco-lens/
├── assets/              # Static assets like images, fonts, and icons
│   ├── fonts/
│   └── images/
├── src/                 # Main source code directory
│   ├── api/             # Functions for making API calls to the backend
│   ├── components/      # Reusable, shared UI components (e.g., Button, Card, Input)
│   ├── constants/       # App-wide constants (e.g., colors, theme styles, API endpoints)
│   ├── hooks/           # Custom React hooks (e.g., useAuth, useApi)
│   ├── navigation/      # React Navigation setup (stacks, tabs, and routing logic)
│   ├── screens/         # Top-level screen components (e.g., HomeScreen, LoginScreen)
│   ├── store/           # State management logic (e.g., Redux, Zustand, or Context)
│   └── utils/           # Helper functions and utility scripts
├── App.js               # The main entry point of the application
├── babel.config.js      # Babel configuration
├── package.json         # Project dependencies and scripts
└── README.md            # You are here!
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine for development.

### Prerequisites

-   **Node.js (LTS version):** [Download here](https://nodejs.org/)
-   **Git:** [Download here](https://git-scm.com/)
-   **Expo Go App:** Install it on your iOS or Android phone from the App Store / Google Play Store.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    https://github.com/lasitha-dev/Eco-Lens.git
    cd eco-lens
    ```

2.  **Install Dependencies:**
    ```sh
    npm install
    ```

3.  **Set Up Environment Variables:**
    -   Create a `.env` file in the root directory with:
        ```
        API_URL=http://localhost:5002/api
        ```
    -   Create a `.env` file in the backend directory with your MongoDB URI, email settings, and port configuration.

### Running the Application

1.  **Start the Metro Bundler:**
    ```sh
    npx expo start
    ```

2.  **Open on your phone:**
    -   A terminal window will open showing a QR code.
    -   Open the **Expo Go** app on your phone.
    -   Scan the QR code. The app will build and load onto your device.

Any changes you make to the code will now automatically reload in the app!
