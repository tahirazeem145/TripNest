# Travel Photo Sharing Community Platform

## 1. Title

**Travel Photo Sharing Community Platform**

A community-based web application for sharing travel photographs, discovering destinations, and connecting travelers through location-based travel experiences.

---

## 2. Domain

**Travel & Social Networking**

The application combines travel discovery, photo sharing, social networking, and location-based content into a single platform.

---

## 3. Who is the User?

### 1. Traveler / Regular User

* Creates an account and manages their profile.
* Uploads and shares travel photographs.
* Adds destinations, descriptions, and travel tags.
* Likes, comments on, and saves other users' posts.
* Follows other travelers.
* Discovers new destinations through community posts.

### 2. Travel Content Creator

* Shares high-quality travel photographs and detailed travel experiences.
* Creates travel stories and destination guides.
* Builds a following based on their travel content.
* Helps other users discover destinations through personal experiences.

### 3. Administrator

* Manages users and community content.
* Reviews reported posts and comments.
* Removes inappropriate or misleading content.
* Manages platform-level data and monitors community activity.

---

## 4. What Problem Are We Solving?

Travelers currently use multiple platforms such as social media, travel blogs, review websites, and search engines to discover destinations and understand other people's travel experiences. However, these platforms are either designed for general social content or primarily focus on reviews, ratings, and commercial travel information.

For example, a traveler planning a trip to **Munnar** may find hundreds of photographs on social media but struggle to identify the exact location, understand the experience behind the photograph, or find other travelers who have visited the same place.

The proposed platform solves this problem by providing a dedicated travel community where users can share photographs along with destination information, travel experiences, and location details. This allows travelers to discover destinations through authentic, community-generated visual content in one centralized platform.

---

## 5. Proposed Solution

The application will provide the following features:

### User Authentication

* User registration and login.
* Secure authentication.
* User profile management.

### Travel Photo Sharing

* Upload travel photographs.
* Add title and description.
* Associate photographs with a destination.
* Add travel-related hashtags/tags.
* Edit or delete personal posts.

### Social Interaction

* Like posts.
* Comment on posts.
* Follow/unfollow travelers.
* View a personalized feed.
* Receive notifications for interactions.

### Destination Discovery

* Search for destinations.
* Browse photographs by destination.
* Filter content using categories and tags.
* View popular/trending destinations.

### Travel Stories

* Users can organize multiple photographs into a travel story.
* Add descriptions and locations to different parts of a journey.
* View trips as a chronological travel experience.

### Saved Content

* Save interesting photographs.
* Create collections of destinations.
* View saved destinations for future travel planning.

### Reporting & Moderation

* Users can report inappropriate content.
* Administrators can review reported posts/comments.
* Administrators can remove violating content or restrict users.

### Admin Dashboard

* Manage users.
* Manage posts and comments.
* Review reports.
* Monitor basic platform activity.

---

## 6. Core Entities / Database Tables

The proposed system will use the following core database tables:

### 1. Users

Stores user account and profile information.

**Fields:**

* user_id
* name
* email
* password
* profile_photo
* bio
* role
* created_at

### 2. Posts

Stores travel photographs and their associated information.

**Fields:**

* post_id
* user_id
* title
* description
* image_url
* destination_id
* created_at

### 3. Destinations

Stores information about travel destinations.

**Fields:**

* destination_id
* name
* country
* state
* latitude
* longitude
* description

### 4. Comments

Stores comments made on travel posts.

**Fields:**

* comment_id
* post_id
* user_id
* content
* created_at

### 5. Likes

Stores user interactions with posts.

**Fields:**

* like_id
* post_id
* user_id
* created_at

### 6. Follows

Stores relationships between users.

**Fields:**

* follow_id
* follower_id
* following_id
* created_at

### 7. Travel Stories

Stores collections of travel experiences.

**Fields:**

* story_id
* user_id
* title
* description
* cover_image
* created_at

### 8. Story Items

Stores individual posts/photos belonging to a travel story.

**Fields:**

* story_item_id
* story_id
* post_id
* sequence_number

### 9. Saved Posts

Stores posts saved by users.

**Fields:**

* saved_id
* user_id
* post_id
* created_at

### 10. Reports

Stores reports submitted against inappropriate content.

**Fields:**

* report_id
* reporter_id
* post_id
* reason
* status
* created_at

---

## 7. User Roles & Permissions

### Traveler / User

**Permissions:**

* Register and login.
* Manage personal profile.
* Create travel posts.
* Upload photographs.
* Edit/delete own posts.
* Like and comment on posts.
* Follow/unfollow users.
* Save posts.
* Create travel stories.
* Report inappropriate content.
* View and search destinations.

### Administrator

**Permissions:**

* View and manage users.
* View all posts.
* Remove inappropriate posts.
* Manage reported content.
* Delete inappropriate comments.
* Restrict or deactivate users when necessary.
* Monitor platform activity.

### Permission Summary

| Feature               | User         | Admin       |
| --------------------- | ------------ | ----------- |
| Register/Login        | ✅            | ✅           |
| Manage Own Profile    | ✅            | ✅           |
| Upload Photos         | ✅            | ❌           |
| Create Posts          | ✅            | ❌           |
| Like/Comment          | ✅            | ❌           |
| Follow Users          | ✅            | ❌           |
| Save Posts            | ✅            | ❌           |
| Create Travel Stories | ✅            | ❌           |
| Report Content        | ✅            | ✅           |
| Manage Users          | ❌            | ✅           |
| Remove Posts          | Own Posts    | Any Post    |
| Manage Reports        | ❌            | ✅           |
| Manage Comments       | Own Comments | Any Comment |

---

## 8. Success Criteria

The application will be considered successful if:

1. A new user can **register and log in within 1 minute**.
2. A user can **upload and publish a travel photograph within 2 minutes**.
3. A user can search for a destination and find relevant community posts.
4. A user can like, comment, save, and share travel posts successfully.
5. A user can follow another traveler and view their content in the feed.
6. A user can create and view a travel story containing multiple photographs.
7. An administrator can review and manage reported content.
8. The application securely stores user and post information in the database.
9. Unauthorized users cannot access administrator functions.
10. The application provides a responsive and usable interface on desktop and mobile screens.

---

## 9. Out of Scope

To keep the project achievable within the capstone timeline, the following features will **not** be implemented:

* Online hotel booking.
* Flight or train ticket booking.
* Online payment processing.
* Travel package booking.
* Real-time travel agent services.
* Real-time GPS tracking of users.
* Ride-hailing or transportation services.
* Professional photo editing tools.
* Direct integration with airline or hotel booking systems.
* Advanced AI-based travel planning.
* Monetization and creator payments.
* Live video streaming.
* Cryptocurrency or blockchain-based features.

The project will focus primarily on **travel photo sharing, destination discovery, social interaction, and community-generated travel experiences**.

---

## 10. Chosen Track

### Java – Spring Boot

**Backend:** Java + Spring Boot

**Database:** MySQL / PostgreSQL

**API:** REST API

**Frontend:** HTML, CSS, JavaScript / React

**ORM:** Spring Data JPA / Hibernate

**Security:** Spring Security

**Build Tool:** Maven

**Version Control:** Git + GitHub

### Proposed Architecture

The application will follow a layered architecture:

**Frontend → REST API → Spring Boot → Service Layer → Repository Layer → Database**

The backend will expose RESTful APIs for authentication, users, posts, destinations, comments, likes, follows, saved posts, travel stories, and administration.

This architecture provides a modular and maintainable structure that can be extended with additional travel features in the future.
