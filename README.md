📌 What This Project Does

ServiceHub makes it easy to:

Let users explore and book services

Allow service providers to manage what they offer

Give admins full control over the platform

Secure the system using JWT authentication

Enforce role-based access across the application\


This project is built using:

1.Java 17+

2.Spring Boot

3.Spring Security

4.JWT (JSON Web Token)

5.MySQL 

6. Reactjs
   
👥 Application Roles

🔑 Admin

1.Admins have full platform control. They can:

2.Manage users

3.Manage service providers

4.Manage categories

5.View all bookings

🙋 User

1.Regular users of the platform can:

2.Register and log in

3.Browse available services

4.Book services

5.Add review.

🧰 Service Provider

Service providers use the system to:

1.Register and log in

2.Add and manage services

3.Accept or reject bookings

📂 Project Structure
      com.servicehub
       ├── config          # Security and seed configuration
       ├── controller      # REST API endpoints
       ├── dto             # Request/response models
       ├── entity          # JPA entities
       ├── exception       # Global exception handling
       ├── repository      # Database repositories
       ├── security        # JWT and authentication logic
       └── service         # Business logic layer

🧪 SomeKey API Endpoints

🔑 Authentication
POST /auth/register
POST /auth/login

👤 User APIs
GET /user/profile
POST /user/book

🧰 Provider APIs
POST /provider/service
GET /provider/bookings

👑 Admin APIs
GET /admin/users
GET /admin/providers    
