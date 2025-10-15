# 🧠 AI Project Planner

AI Project Planner is a web application that leverages Google Gemini’s AI to break down complex goals into actionable, structured project plans. Each plan includes tasks, dependencies, durations, and estimated completion dates.

## Features

Goal Breakdown: Converts high-level goals into sequential, actionable tasks.
Structured Output: Tasks follow a consistent JSON schema for easy processing.
Dependencies: Tasks clearly indicate what they depend on.
Realistic Scheduling: Provides estimated task durations and completion dates.
Modern Frontend: Built with HTML, JavaScript, and Tailwind CSS for clean UI.

## Tech Stack
Component	Technology	Role
Backend/Server	Node.js + Express	Handles HTTP requests and calls Gemini API securely.
AI Integration	Google GenAI SDK	Communicates with gemini-2.5-flash-preview-05-20.
Frontend Styling	Tailwind CSS	Provides responsive and modern UI.
Frontend Logic	JavaScript (app.js)	Handles user input, API calls, and DOM updates.

## Installation & Setup
### 1. Prerequisites

Node.js (includes npm) installed.

### 2. Setup
Navigate to project folder

### Initialize project & install dependencies
npm init -y

npm install express @google/genai

### 3. Set Gemini API Key

Linux/macOS:

export GEMINI_API_KEY="YOUR_API_KEY"

Windows CMD:

set GEMINI_API_KEY="YOUR_API_KEY"

Windows PowerShell:

$env:GEMINI_API_KEY="YOUR_API_KEY"

### 4. Run Backend

node server.js

Server runs at http://localhost:3000

### Notes
Ensure backend is running before using the frontend.
Gemini API key is handled server-side; frontend does not expose it.
Tailwind CSS is required for frontend styling.

### License
This project is for educational purposes. Adapt as needed for your own use.
