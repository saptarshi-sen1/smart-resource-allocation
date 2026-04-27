# CrisisConnect Platform - Development Changelog

This document tracks the major updates, features, and fixes applied to the Smart Resource Allocation platform.

## Version 2.0 (Latest Updates)

### 🚀 Major Features
*   **New Landing Page Ecosystem**: 
    *   Renamed the main application dashboard from `index.html` to `dashboard.html`.
    *   Created a completely new, professional landing page (`index.html`) inspired by modern non-profit websites.
    *   Added dedicated static pages: `motive.html`, `instructions.html`, and `contact.html`.
*   **Admin CMS (Content Management System)**: 
    *   Admins can now dynamically edit the text for Our Motive, Instructions, Contact Details, and Landing Page Statistics directly from the `dashboard.html` interface. These changes are saved to a new `siteContent` collection in Firestore.
*   **Background AI Matcher**: 
    *   Implemented a serverless background scheduler. The application now checks the `settings/system` database on every load, and if it has been 1 hour since the last run, it executes the AI Matching algorithm completely silently in the background.

### 🧠 Logic & Algorithm Enhancements
*   **Aggressive Skill Matching**: The `runMatchingAlgorithm` was heavily updated. If a volunteer possesses *even a single skill* that aligns with an NGO's request, they are given a massive +500 point boost, virtually guaranteeing their auto-allocation to that crisis.
*   **Inactive Volunteer Tracking**: The system now records a `lastLogin` timestamp every time a volunteer authenticates. If their last login exceeds 30 days, their availability status turns red and displays as **"Inactive (>30 days)"** across all search and match views.
*   **Unified Match Views**: Fixed a bug where manual matches made by NGOs (`confirmedMatches` collection) were invisible to volunteers. Both `matches` and `confirmedMatches` are now merged and displayed seamlessly on the Volunteer and Admin dashboards.

### 💅 UI/UX Polish
*   **Direct Communication**: Added hover tooltips to display email addresses on matched cards. Added a dedicated "Contact" button that opens the user's default email client (`mailto:`) to facilitate instant communication between matched NGOs and Volunteers.
*   **Centered Form Elements**: Overhauled `style.css` to center all form labels and input fields for a cleaner, more focused aesthetic.
*   **Admin Match Management**: Admins now have a destructive "Remove" button next to every match, allowing them to manually delete/un-allocate matches from the database.
*   **Expanded Analytics**: Added placeholder structural canvases in the Admin dashboard for "Matches Over Time" and "Volunteer Skills Distribution" charts.
*   **Consistent Branding**: Added the "Developed by Saptarshi Sen" professional footer to the bottom of all pages in the platform.
*   **NGO Form Clarity**: Added a dedicated "NGO Name" input field to the request form so it is tracked separately from the "Need Type".

### 🐛 Bug Fixes
*   **Key Exchange UI Bleed**: Fixed a critical HTML structure bug (`</div>` placement) that was causing the NGO's exclusive "Confirm Match via Key Exchange" section to mistakenly appear inside the Volunteer's profile dashboard.
