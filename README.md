# Software Engineering 2 Project

## E-Commerce Microservices System

This project is a full-stack distributed e-commerce system built using microservices architecture.

It includes:
- React Frontend
- Spring Boot Microservices Backend
- API Gateway
- Eureka Service Discovery
- MySQL Database (Dockerized)
- Docker Compose orchestration

---

# Project Structure

- FrontSW → React Frontend
- ecommerce-microservices → Backend Microservices
- docker-compose.yml → Runs entire backend system

---

# How to Run

## 1. Start Backend

```bash
cd ecommerce-microservices
docker-compose up --build
