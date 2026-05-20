# Introduction to Architect.io

**Architect.io** is a visual backend development platform that allows engineers to design, visualise, and generate production-ready backend applications using a sophisticated node-based canvas interface.

## Why Architect.io?

- **Visual Clarity**: Understand your data models, API flows, and infrastructure at a glance with a drag-and-drop canvas.
- **Speed**: Go from architectural design to a working backend in seconds, not hours.
- **Best Practices**: Generated code follows clean MVC architecture, modular service patterns, and proper separation of concerns.
- **Security**: Built-in JWT authentication, 6-digit OTP email verification, and middleware support.
- **System Design Learning**: Production-grade templates with embedded study documentation (capacity estimation, trade-offs, interview prep).

## Platform Highlights

| Feature                         | Status  |
| ------------------------------- | ------- |
| Visual Canvas Builder           | ✅ Live |
| 16 Specialised Node Types       | ✅ Live |
| 6 Production Templates          | ✅ Live |
| Express.js Code Generation      | ✅ Live |
| Docker Compose Export            | ✅ Live |
| Architecture Documentation Gen  | ✅ Live |
| Demo Mode (No Account)          | ✅ Live |
| Public Roadmap & Changelog      | ✅ Live |
| OTP Email Authentication        | ✅ Live |
| Admin Dashboard & Analytics     | ✅ Live |

## High-Level Architecture

The platform consists of three main components:

1. **Visual Parser**: Converts node-based JSON architectures into executable JavaScript services, controllers, and models.
2. **Canvas Engine**: A high-performance React Flow canvas with 16 custom node types, layer zones, auto-layout, and animated edges.
3. **Auth & Analytics Engine**: JWT authentication with email OTP, geolocation tracking, and admin dashboard with Radar/Area charts.

## Node Types Overview

Architect.io supports 16 node types across 6 architectural layers:

- **Gateway Layer**: CDN, Load Balancer, API Gateway
- **Application Layer**: API, Auth, Logic, Middleware
- **Data Layer**: Entity, Database, Cache, Storage, Replica
- **Messaging Layer**: Queue
- **Infrastructure**: Counter Service
- **Integration**: Mail, Webhook, Cron
