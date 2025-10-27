# Web Multiplayer Tactical Shooter Game

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A **web-based multiplayer tactical shooter game** with private rooms, competitive modes, and stylised 3D/2.5D graphics. This project is scalable, containerised, and production-ready.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Tech Stack](#tech-stack)
* [Codebase Structure](#codebase-structure)
* [Implementation Roadmap](#implementation-roadmap)
* [Deployment](#deployment)
* [Key Risks & Mitigation](#key-risks--mitigation)
* [License](#license)

---

## Project Overview

This is a **real-time web multiplayer tactical shooter game** featuring:

* Private rooms with password protection
* Competitive modes: Team Deathmatch (5v5) & Capture the Flag
* Stylised graphics with 3D or 2.5D rendering
* Authoritative match servers for cheat prevention
* Scalable backend and containerised deployment
* Analytics & monitoring for player activity and game events

---

## Tech Stack

### Front-End

* React + TypeScript
* Three.js / Babylon.js / Phaser 3
* Tailwind CSS / Chakra UI + styled-components
* Redux Toolkit / Zustand
* WebSocket (socket.io-client / ws)
* Vite / Webpack
* Vercel (static deployment)

### Back-End

* Node.js + NestJS (TypeScript) or Go + Gin or Rust + Actix/Tokio
* WebSocket / Binary Protocol: ws, uWebSockets.js, gorilla/websocket
* Protobuf / FlatBuffers + msgpack for binary serialization
* REST API: OpenAPI + Swagger
* Database: PostgreSQL + Redis
* Match server: container-per-room, autoscaled with Kubernetes

### DevOps / Infrastructure

* Docker, Kubernetes (EKS/GKE) / ECS
* CI/CD: GitHub Actions (lint → test → build → deploy)
* Monitoring: Prometheus + Grafana, ELK/Loki
* Terraform for IaC
* CDN: Cloudflare / AWS CloudFront

---

## Codebase Structure

```
/repo-root
  /apps
    /frontend
    /backend
    /match-server
  /libs
    /shared
      /interfaces
      /utils
      /protocols
  /docker
    docker-compose.yml
  /infrastructure
    terraform/
    k8s-manifests/
```

---

## Implementation Roadmap

**Sprint Plan (2 weeks per sprint):**

### Sprint 1 – Setup & Skeleton

* Initialize monorepo, frontend/backend/match-server structure
* Frontend: login screen, lobby skeleton
* Backend: REST API for signup/login, room creation
* Docker-compose local environment
* CI pipeline setup (lint + unit tests)
* Infrastructure skeleton: Terraform for VPC/subnet, basic K8s namespace

### Sprint 2 – Lobby & Room Management

* Backend API: create/join/list rooms with in-memory storage
* WebSocket: lobby ready/unready, start match events
* Frontend: lobby UI, room list, join/create UI
* Deploy backend to dev environment, basic load testing

### Sprint 3 – Match Server Prototype

* Authoritative server: movement & shooting between 2 players
* Define client input & snapshot packets
* Minimal 3D or canvas world with basic controls
* Matchmaking routes to spin up match-server instance
* Containerise match-server, deploy single instance for testing

### Sprint 4 – Weapon & Combat Mechanics

* Implement weapon classes: pistol, rifle, shotgun
* Movement/cover mechanics: crouch, slide
* UI: health bars, ammo counters
* Backend: authoritative damage resolution, hit confirmation
* Analytics: capture match start/end events

### Sprint 5 – Game Modes & Maps

* Implement Team Deathmatch (5v5) and Capture the Flag
* Design 2 stylised maps
* Client map loader, server spawn logic
* Mode logic: score/time limit, win condition
* Frontend: mode and map selection UI
* Multiple match-servers concurrently, autoscaling simulation

### Sprint 6 – Progression & Store

* Database: players, weapons, skins, progression track
* Backend APIs: unlocks, store purchases, progression
* Frontend: store and battle pass UI
* Monetisation logic: free vs premium track
* Analytics: track purchases and progression completion

### Sprint 7 – Social & Clans

* Friend list + invites, private room passwords
* Clan system: create, invite, chat
* Frontend: chat and friend list UI
* Backend: APIs and persistence for social/clan features

### Sprint 8 – Live-Ops & Production

* Admin dashboard for live events: map rotation, special weapons, seasonal pass
* Monitoring: match server metrics, API latency, DB queries
* Logging: error logs, match logs
* Deploy to production region (Mumbai)
* Autoscale match servers based on queue length
* Launch beta/test with small user base

---

## Deployment

1. Containerise backend, match server, frontend build
2. Kubernetes deployment with autoscaling
3. CI/CD: GitHub Actions → lint → test → build → deploy
4. Terraform for cloud infra (AWS Mumbai)
5. CDN for frontend assets

---

## Key Risks & Mitigation

* **Latency / Cheat**: Authoritative server + encrypted packets
* **Scaling Match Servers**: Autoscale, moderate match size
* **Complexity Creep**: Keep MVP minimal, iterate
* **Monetisation Backlash**: Focus on cosmetics and fair unlock track
* **Retention / Engagement**: Prioritise UX & social systems early

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
