# Architect.io - Backend Core 🚀

Welcome to the engine room of **Architect.io**, a visual backend intelligence platform that transforms node-based designs into high-performance, production-ready MERN stack applications.

## 🌟 Introduction
Architect.io is designed to bridge the gap between visual design and technical implementation. This backend service manages user authentication, stores visual architecture states, generates modular server-side code, and provides deep analytical insights through a comprehensive Admin Dashboard.

## 🏗️ Project Architecture
The backend follows a **Modular Monolith** pattern, ensuring scalability and ease of maintenance:

- **Auth Layer**: Implements a secure JWT-based authentication system with enhanced **Email OTP Verification** and silent geolocation detection.
- **Data Layer**: Powered by **MongoDB & Mongoose**, featuring a precise schema for users, workflows, and geographical tracking.
- **Workflow Engine**: Manages the persistence of visual node-based architectures and edge relationships.
- **Generator Core**: A custom-built engine that parses visual JSON structures into structured Node.js/Express files.
- **Admin Suite**: Provides high-granularity analytics, including registration tracking by Country, State, and City, visualized through sophisticated Radar and Area charts.
- **Security**: Features multi-attempt limiting for OTPs, password hashing (BcryptJS), and environment-driven configurations.

## 🛠️ Tech Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Security**: JWT, BcryptJS
- **Communication**: Nodemailer (SMTP Integration)
- **Analytics**: Custom Mongoose Aggregation Pipelines

## 👨‍💻 Developer Information
**Geetansh Agrawal**  
*Full Stack Developer & AI Integration Specialist*

I built Architect.io with the vision of making backend engineering more accessible, visual, and automated. By combining visual logic with precise code generation, I aim to help developers ship complex infrastructures faster than ever before.

---
*Developed with ❤️ by Geetansh Agrawal*
