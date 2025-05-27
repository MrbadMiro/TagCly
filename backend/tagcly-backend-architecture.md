# TagCly Backend Architecture
## Complete Models and Controllers Documentation

### Table of Contents
1. [Introduction](#introduction)
2. [Models (MongoDB Schema)](#models-mongodb-schema)
3. [Controllers](#controllers)
4. [API Architecture](#api-architecture)
5. [Conclusion](#conclusion)

## Introduction

TagCly is a revolutionary predictive pet health management system built using the MERN stack (MongoDB, Express.js, React, Node.js) that integrates IoT-based smart collars, machine learning algorithms, and blockchain security. This document outlines the complete backend architecture, focusing on the data models and controllers that power the system.

## Models (MongoDB Schema)

### 1. User Model
- **Fields:**
  - `username`: String (unique)
  - `email`: String (unique)
  - `password`: String (hashed)
  - `role`: String (user, admin)
  - `profile`: {
    - `firstName`: String
    - `lastName`: String
    - `phoneNumber`: String
    - `address`: String
    - `profileImage`: String (URL)
  }
  - `pets`: [ObjectId] (references Pet model)
  - `subscriptionStatus`: String
  - `notifications`: [ObjectId] (references Notification model)
  - `createdAt`: Date
  - `updatedAt`: Date

### 2. Pet Model
- **Fields:**
  - `name`: String
  - `owner`: ObjectId (references User model)
  - `species`: String (dog, cat, etc.)
  - `breed`: String
  - `age`: Number
  - `weight`: Number
  - `gender`: String
  - `healthConditions`: [String]
  - `medications`: [{
    - `name`: String
    - `dosage`: String
    - `frequency`: String
    - `startDate`: Date
    - `endDate`: Date
  }]
  - `vaccinations`: [{
    - `type`: String
    - `date`: Date
    - `nextDueDate`: Date
  }]
  - `collar`: ObjectId (references Collar model)
  - `profileImage`: String (URL)
  - `createdAt`: Date
  - `updatedAt`: Date

### 3. Collar Model
- **Fields:**
  - `serialNumber`: String (unique)
  - `macAddress`: String (unique)
  - `petId`: ObjectId (references Pet model)
  - `firmware`: {
    - `version`: String
    - `lastUpdated`: Date
  }
  - `batteryLevel`: Number
  - `status`: String (active, inactive)
  - `sensors`: [{
    - `type`: String
    - `status`: String
    - `lastCalibrated`: Date
  }]
  - `createdAt`: Date
  - `updatedAt`: Date

### 4. Health Data Model
- **Fields:**
  - `petId`: ObjectId (references Pet model)
  - `collarId`: ObjectId (references Collar model)
  - `timestamp`: Date
  - `dataType`: String (activity, heart rate, temperature, etc.)
  - `value`: Mixed (depends on dataType)
  - `metadata`: {
    - `latitude`: Number
    - `longitude`: Number
    - `accuracy`: Number
  }
  - `processed`: Boolean
  - `anomalyScore`: Number

### 5. ML Prediction Model
- **Fields:**
  - `petId`: ObjectId (references Pet model)
  - `predictionType`: String (health risk, behavior, nutrition)
  - `timestamp`: Date
  - `prediction`: Mixed
  - `confidence`: Number
  - `dataPoints`: [ObjectId] (references Health Data model)
  - `actionTaken`: Boolean
  - `feedback`: {
    - `accurate`: Boolean
    - `veterinarianVerified`: Boolean
    - `comments`: String
  }

### 6. Alert Model
- **Fields:**
  - `petId`: ObjectId (references Pet model)
  - `userId`: ObjectId (references User model)
  - `alertType`: String (emergency, warning, info)
  - `message`: String
  - `timestamp`: Date
  - `triggered`: {
    - `by`: String (system, user, veterinarian)
    - `dataPoints`: [ObjectId] (references Health Data model)
  }
  - `read`: Boolean
  - `actions`: [{
    - `type`: String
    - `timestamp`: Date
    - `result`: String
  }]

### 7. Payment Model
- **Fields:**
  - `userId`: ObjectId (references User model)
  - `amount`: Number
  - `currency`: String
  - `paymentMethod`: String
  - `status`: String
  - `transactionId`: String
  - `items`: [{
    - `type`: String (collar, subscription)
    - `description`: String
    - `amount`: Number
  }]
  - `billingAddress`: {
    - `line1`: String
    - `line2`: String
    - `city`: String
    - `state`: String
    - `postalCode`: String
    - `country`: String
  }
  - `timestamp`: Date

### 8. Community Post Model
- **Fields:**
  - `userId`: ObjectId (references User model)
  - `title`: String
  - `content`: String
  - `media`: [String] (URLs)
  - `tags`: [String]
  - `likes`: [ObjectId] (references User model)
  - `comments`: [{
    - `userId`: ObjectId
    - `content`: String
    - `timestamp`: Date
  }]
  - `createdAt`: Date
  - `updatedAt`: Date

### 9. Gamification Model
- **Fields:**
  - `petId`: ObjectId (references Pet model)
  - `userId`: ObjectId (references User model)
  - `goals`: [{
    - `type`: String
    - `target`: Number
    - `currentProgress`: Number
    - `startDate`: Date
    - `endDate`: Date
    - `completed`: Boolean
  }]
  - `rewards`: [{
    - `type`: String
    - `description`: String
    - `awarded`: Date
    - `redeemed`: Boolean
  }]
  - `streaks`: {
    - `current`: Number
    - `longest`: Number
    - `lastActive`: Date
  }
  - `points`: Number

### 10. Blockchain Record Model
- **Fields:**
  - `petId`: ObjectId (references Pet model)
  - `recordType`: String (health certificate, ownership)
  - `hashValue`: String
  - `transactionId`: String
  - `timestamp`: Date
  - `metadata`: Mixed
  - `verificationStatus`: String

## Controllers

### 1. User Management Controllers
- **registerUser**: Handles new user registration with validation
- **loginUser**: Authenticates users and issues JWT tokens
- **refreshToken**: Issues new JWT tokens using refresh token
- **getUserProfile**: Retrieves user profile data
- **updateUserProfile**: Updates user profile information
- **changePassword**: Updates user password with validation
- **deleteUser**: Soft-deletes user account
- **forgotPassword**: Initiates password reset workflow
- **resetPassword**: Completes password reset with token
- **getNotifications**: Retrieves user notifications
- **markNotificationAsRead**: Updates notification status
- **uploadProfileImage**: Handles profile image uploads

### 2. Pet Management Controllers
- **registerPet**: Creates new pet profile linked to user
- **getPetDetails**: Retrieves detailed pet information
- **updatePetDetails**: Updates pet profile information
- **deletePet**: Removes pet profile
- **getPetList**: Lists all pets for a user
- **addHealthCondition**: Adds new health condition to pet profile
- **removeHealthCondition**: Removes health condition from pet profile
- **addMedication**: Adds medication information to pet profile
- **updateMedication**: Updates existing medication information
- **removeMedication**: Removes medication from pet profile
- **addVaccination**: Adds vaccination record to pet profile
- **updateVaccination**: Updates vaccination record
- **removeVaccination**: Removes vaccination record
- **uploadPetImage**: Handles pet image uploads

### 3. Collar Management Controllers
- **registerCollar**: Links collar to pet and activates
- **getCollarDetails**: Retrieves collar information
- **updateCollarFirmware**: Triggers firmware update process
- **resetCollar**: Factory resets collar configuration
- **calibrateCollar**: Calibrates collar sensors
- **checkBatteryStatus**: Retrieves current battery level
- **deactivateCollar**: Temporarily disables collar
- **activateCollar**: Re-enables collar
- **transferCollar**: Transfers collar to different pet
- **getCollarDiagnostics**: Retrieves diagnostic information
- **configureSensors**: Updates sensor configuration

### 4. Health Data Controllers
- **ingestHealthData**: Processes incoming collar sensor data
- **getHealthData**: Retrieves pet health data with filtering
- **getHealthMetrics**: Provides aggregated health metrics
- **getActivityTrends**: Analyzes activity patterns over time
- **getSleepAnalysis**: Provides sleep quality analysis
- **getVitalSigns**: Retrieves vital signs with trends
- **getLocationHistory**: Retrieves pet location history
- **exportHealthData**: Exports health data in various formats
- **getHealthDataStatistics**: Provides statistical analysis
- **deleteHealthData**: Removes specific health data points

### 5. ML Prediction Controllers
- **generateHealthPredictions**: Creates health risk predictions
- **getBehaviorAnalysis**: Analyzes pet behavior patterns
- **getNutritionRecommendations**: Provides dietary recommendations
- **getActivityRecommendations**: Suggests activity levels
- **getHealthTrends**: Predicts future health trends
- **getAnomalyDetection**: Identifies abnormal patterns
- **getRiskAssessment**: Evaluates health risk factors
- **getPredictionFeedback**: Collects user feedback on predictions
- **updateMLModels**: Triggers model retraining
- **explainPrediction**: Provides explanation for predictions

### 6. Alert Controllers
- **createAlert**: Generates new alert based on criteria
- **getAlerts**: Retrieves alerts for user/pet
- **markAlertAsRead**: Updates alert read status
- **dismissAlert**: Removes alert from active list
- **escalateAlert**: Increases alert severity
- **notifyEmergencyContacts**: Alerts emergency contacts
- **getEmergencyServices**: Locates nearby emergency services
- **configureAlertSettings**: Updates alert preferences
- **getUnreadAlertCount**: Counts unread alerts
- **getAlertHistory**: Retrieves historical alerts

### 7. Payment Controllers
- **initiatePayment**: Begins payment process
- **processPayment**: Handles payment gateway callbacks
- **getPaymentHistory**: Retrieves payment records
- **generateInvoice**: Creates downloadable invoice
- **refundPayment**: Processes refund requests
- **verifyPayment**: Confirms payment status
- **subscribeUser**: Handles subscription setup
- **cancelSubscription**: Processes subscription cancellation
- **upgradeSubscription**: Handles subscription plan changes
- **getSubscriptionDetails**: Retrieves subscription information

### 8. Community Controllers
- **createPost**: Creates new community post
- **getPosts**: Retrieves community posts with filtering
- **getPostDetails**: Retrieves detailed post information
- **updatePost**: Modifies existing post
- **deletePost**: Removes post
- **likePost**: Toggles post like status
- **addComment**: Adds comment to post
- **updateComment**: Modifies existing comment
- **deleteComment**: Removes comment
- **searchPosts**: Searches posts by criteria
- **getFeaturedPosts**: Retrieves highlighted community content
- **reportPost**: Handles inappropriate content reports

### 9. Gamification Controllers
- **createGoal**: Sets new health goal for pet
- **getGoals**: Retrieves current goals
- **updateGoalProgress**: Updates progress towards goals
- **completeGoal**: Marks goal as achieved
- **awardPoints**: Grants points for activities
- **redeemReward**: Processes reward redemption
- **getRewards**: Lists available and earned rewards
- **getLeaderboard**: Retrieves community rankings
- **updateStreak**: Updates achievement streaks
- **getAchievements**: Lists unlocked achievements
- **suggestGoals**: Recommends personalized goals
- **celebrateProgress**: Triggers milestone celebrations

### 10. Admin Controllers
- **getDashboardMetrics**: Retrieves system-wide statistics
- **getUserManagement**: Handles user administration
- **getSystemLogs**: Retrieves application logs
- **manageCollars**: Administers collar inventory
- **manageSubscriptions**: Oversees subscription plans
- **getAnalytics**: Retrieves usage analytics
- **moderateCommunity**: Reviews reported content
- **configureSystem**: Updates system settings
- **manageMLModels**: Oversees ML model performance
- **exportData**: Exports aggregated system data
- **monitorPerformance**: Tracks system performance
- **manageVeterinarians**: Administers veterinarian accounts

### 11. Blockchain Controllers
- **createHealthCertificate**: Generates blockchain-verified health records
- **verifyHealthCertificate**: Validates authenticity of health records
- **transferOwnership**: Records pet ownership transfers on blockchain
- **getBlockchainRecord**: Retrieves blockchain record details
- **getVerificationHistory**: Lists verification attempts

## API Architecture

The TagCly API follows RESTful principles with the following route structure:

1. **Authentication Routes**
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/refresh-token
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password

2. **User Routes**
   - GET /api/users/profile
   - PUT /api/users/profile
   - PUT /api/users/password
   - DELETE /api/users
   - GET /api/users/notifications
   - PUT /api/users/notifications/:id
   - POST /api/users/profile-image

3. **Pet Routes**
   - POST /api/pets
   - GET /api/pets
   - GET /api/pets/:id
   - PUT /api/pets/:id
   - DELETE /api/pets/:id
   - POST /api/pets/:id/health-conditions
   - DELETE /api/pets/:id/health-conditions/:conditionId
   - POST /api/pets/:id/medications
   - PUT /api/pets/:id/medications/:medicationId
   - DELETE /api/pets/:id/medications/:medicationId
   - POST /api/pets/:id/vaccinations
   - PUT /api/pets/:id/vaccinations/:vaccinationId
   - DELETE /api/pets/:id/vaccinations/:vaccinationId
   - POST /api/pets/:id/image

4. **Collar Routes**
   - POST /api/collars
   - GET /api/collars/:id
   - PUT /api/collars/:id/firmware
   - POST /api/collars/:id/reset
   - POST /api/collars/:id/calibrate
   - GET /api/collars/:id/battery
   - PUT /api/collars/:id/status
   - PUT /api/collars/:id/transfer
   - GET /api/collars/:id/diagnostics
   - PUT /api/collars/:id/sensors

5. **Health Data Routes**
   - POST /api/health-data
   - GET /api/pets/:id/health-data
   - GET /api/pets/:id/metrics
   - GET /api/pets/:id/activity
   - GET /api/pets/:id/sleep
   - GET /api/pets/:id/vitals
   - GET /api/pets/:id/location
   - GET /api/pets/:id/health-data/export
   - GET /api/pets/:id/health-data/statistics
   - DELETE /api/health-data/:id

6. **ML Prediction Routes**
   - GET /api/pets/:id/predictions/health
   - GET /api/pets/:id/predictions/behavior
   - GET /api/pets/:id/predictions/nutrition
   - GET /api/pets/:id/predictions/activity
   - GET /api/pets/:id/predictions/trends
   - GET /api/pets/:id/predictions/anomalies
   - GET /api/pets/:id/predictions/risks
   - POST /api/predictions/:id/feedback
   - POST /api/predictions/update-models
   - GET /api/predictions/:id/explanation

7. **Alert Routes**
   - POST /api/alerts
   - GET /api/users/:id/alerts
   - PUT /api/alerts/:id/read
   - PUT /api/alerts/:id/dismiss
   - PUT /api/alerts/:id/escalate
   - POST /api/alerts/:id/notify-emergency
   - GET /api/alerts/emergency-services
   - PUT /api/users/:id/alert-settings
   - GET /api/users/:id/unread-alerts
   - GET /api/users/:id/alert-history

8. **Payment Routes**
   - POST /api/payments/initiate
   - POST /api/payments/process
   - GET /api/users/:id/payments
   - GET /api/payments/:id/invoice
   - POST /api/payments/:id/refund
   - GET /api/payments/:id/verify
   - POST /api/subscriptions
   - DELETE /api/subscriptions/:id
   - PUT /api/subscriptions/:id
   - GET /api/users/:id/subscription

9. **Community Routes**
   - POST /api/community/posts
   - GET /api/community/posts
   - GET /api/community/posts/:id
   - PUT /api/community/posts/:id
   - DELETE /api/community/posts/:id
   - PUT /api/community/posts/:id/like
   - POST /api/community/posts/:id/comments
   - PUT /api/community/posts/:id/comments/:commentId
   - DELETE /api/community/posts/:id/comments/:commentId
   - GET /api/community/search
   - GET /api/community/featured
   - POST /api/community/posts/:id/report

10. **Gamification Routes**
    - POST /api/pets/:id/goals
    - GET /api/pets/:id/goals
    - PUT /api/pets/:id/goals/:goalId/progress
    - PUT /api/pets/:id/goals/:goalId/complete
    - POST /api/users/:id/points
    - POST /api/users/:id/rewards/:rewardId/redeem
    - GET /api/users/:id/rewards
    - GET /api/leaderboard
    - PUT /api/users/:id/streak
    - GET /api/users/:id/achievements
    - GET /api/pets/:id/suggested-goals
    - POST /api/pets/:id/celebrate

11. **Admin Routes**
    - GET /api/admin/dashboard
    - GET /api/admin/users
    - GET /api/admin/logs
    - GET /api/admin/collars
    - GET /api/admin/subscriptions
    - GET /api/admin/analytics
    - GET /api/admin/moderation
    - PUT /api/admin/system-config
    - GET /api/admin/ml-models
    - GET /api/admin/export
    - GET /api/admin/performance
    - GET /api/admin/veterinarians

12. **Blockchain Routes**
    - POST /api/blockchain/health-certificates
    - GET /api/blockchain/health-certificates/:id/verify
    - POST /api/blockchain/ownership-transfer
    - GET /api/blockchain/records/:id
    - GET /api/blockchain/records/:id/verification-history

## Conclusion

This comprehensive backend architecture provides a solid foundation for the TagCly pet health management system. The models and controllers are designed to handle all aspects of pet health monitoring, from data collection through the smart collar to advanced predictive analytics using machine learning.

The modular approach allows for scalability and easy maintenance, while the integration of blockchain technology ensures data integrity and security for sensitive pet health information.

By following this architecture, the TagCly system can efficiently manage pet health data, provide valuable insights to pet owners, and create a vibrant community of pet lovers committed to proactive pet healthcare.
