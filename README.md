# CrisisConnect: Smart Resource Allocation & Disaster Response

CrisisConnect is a specialized platform designed to optimize disaster response by connecting NGOs with volunteers through intelligent matching. The system leverages real-time data, AI-driven document processing, and a modern web interface to streamline resource allocation in high-pressure environments.

## Platform Overview

The platform provides dedicated interfaces for three distinct user roles, ensuring that every participant has the tools they need to act effectively.

### Volunteer Dashboard
Designed for individuals on the ground, this dashboard allows volunteers to manage their profiles, highlight their specific skill sets (Medical, Rescue, Logistics), and view active requests on interactive maps.
![Volunteer Dashboard](https://via.placeholder.com/800x450?text=Volunteer+Dashboard+Screenshot)

### NGO Dashboard
The central hub for organizations to broadcast their needs. It features a unique OCR tool that allows field officers to scan paper survey forms and instantly convert them into digital resource requests.
![NGO Dashboard](https://via.placeholder.com/800x450?text=NGO+Dashboard+Screenshot)

### Admin Dashboard
A high-level command center for system administrators to monitor platform-wide activity, analyze resource distribution via data charts, and manage global disaster response statistics.
![Admin Dashboard](https://via.placeholder.com/800x450?text=Admin+Dashboard+Screenshot)

## Core Capabilities

### AI-Powered OCR (Optical Character Recognition)
Integrated with Tesseract.js, the platform allows users to scan physical reports and automatically populate digital forms. This reduces manual entry errors and significantly speeds up the reporting process during emergencies.

### Intelligent Matching Engine
A proximity and skill-aware algorithm that ranks volunteers based on their distance from a disaster site and how well their expertise matches the specific requirements of an NGO's request.

### Secure Allocation
A two-way key exchange system ensures that resources are delivered to the correct person, providing a layer of security and accountability for distributed aid.

### Mobile-Ready (Android)
The project includes a robust Android implementation using a customized WebView. It features specific fixes for Google OAuth compatibility (User-Agent spoofing) to ensure a seamless login experience on mobile devices.

## Technical Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism UI), JavaScript (ES6+)
*   **Database**: Firebase Firestore (Real-time NoSQL)
*   **Authentication**: Firebase Auth (Email/Password & Google Login)
*   **AI Engine**: Tesseract.js
*   **Data Visualization**: Chart.js
*   **Mapping**: Leaflet.js
*   **DevOps**: GitHub Actions (CI/CD and Automated Android Builds)

## Setup and Installation

### Web Platform
1. Configure your Firebase project and add the credentials to `env.js`.
2. Deploy using the Firebase CLI: `firebase deploy`.

### Android Application
1. Run `node init_android.js` to generate the Android project structure.
2. The project is pre-configured for GitHub Actions; pushing to the `android-app` branch will automatically trigger a production APK build.

## Multilingual Support
Built-in support for English, Hindi, and Bengali via Google Translate integration, making the platform accessible to a wider demographic during regional crises.
