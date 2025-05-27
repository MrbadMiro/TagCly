import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      enum: ["dog", "cat", "bird", "other"],
      default: "dog",
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      required: true,
    },
    birthDate: Date,
    profileImage: String,

    // Ownership Information
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collar",
    },

    // Health Profile
    healthConditions: {
      type: [String],
      default: [],
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        notes: String,
      },
    ],
    vaccinations: [
      {
        type: String,
        date: Date,
        nextDueDate: Date,
        verified: Boolean,
      },
    ],
    allergies: [String],
    vetContacts: [
      {
        name: String,
        phone: String,
        address: String,
        emergency: Boolean,
      },
    ],

    // Activity and Behavior
    activityLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate",
    },
    trainingStatus: {
      type: String,
      enum: ["untrained", "basic", "advanced"],
      default: "untrained",
    },
    favoriteActivities: [String],
    behaviorNotes: [String],

    // Health Monitoring Data (from sensors)
    activityData: {
      dailySteps: [
        {
          date: Date,
          count: Number,
          distance: Number, // in meters
        },
      ],
      movementPatterns: [
        {
          date: Date,
          walking: Number, // minutes
          running: Number, // minutes
          resting: Number, // minutes
          other: Number, // minutes
        },
      ],
      trends: {
        weeklyChange: Number, // percentage
        monthlyChange: Number,
        lastUpdated: Date,
      },
    },

    sleepData: {
      sessions: [
        {
          date: Date,
          startTime: Date,
          endTime: Date,
          duration: Number, // minutes
          deepSleep: Number, // minutes
          lightSleep: Number, // minutes
          remSleep: Number, // minutes
          disturbances: Number,
          heartRateVariability: Number,
          qualityScore: Number, // 0-100
        },
      ],
      avgQualityScore: Number,
      lastUpdated: Date,
    },

    vitalSigns: {
      heartRate: {
        current: Number,
        history: [
          {
            value: Number,
            timestamp: Date,
          },
        ],
        avgDaily: Number,
      },
      temperature: {
        current: Number,
        history: [
          {
            value: Number,
            timestamp: Date,
          },
        ],
        avgDaily: Number,
      },
      respiratoryRate: {
        current: Number,
        history: [
          {
            value: Number,
            timestamp: Date,
          },
        ],
      },
      lastUpdated: Date,
    },

    // ML Analysis Results
    healthMetrics: {
      score: {
        current: Number, // 0-100
        history: [
          {
            value: Number,
            date: Date,
          },
        ],
        trend: String, // "improving", "stable", "declining"
      },
      riskAssessments: [
        {
          condition: String,
          riskLevel: {
            type: String,
            enum: ["low", "moderate", "high"],
          },
          probability: Number, // 0-100%
          lastUpdated: Date,
        },
      ],
      lastFullAssessment: Date,
    },

    behaviorAnalysis: {
      classifications: [
        {
          type: String,
          timestamp: Date,
          confidence: Number, // 0-1
        },
      ],
      trends: [
        {
          period: String, // "morning", "afternoon", "evening", "night"
          dominantBehavior: String,
          frequency: Number,
        },
      ],
      lastUpdated: Date,
    },

    // Nutrition and Diet
    diet: {
      recommendedCalories: Number,
      currentFood: String,
      feedingSchedule: [
        {
          time: String,
          amount: Number,
          foodType: String,
        },
      ],
      restrictions: [String],
      lastRecommendationUpdate: Date,
    },

    // Emergency Information
    emergencyContacts: [
      {
        name: String,
        relationship: String,
        phone: String,
        priority: Number,
      },
    ],
    lastKnownLocation: {
      coordinates: {
        lat: Number,
        lng: Number,
      },
      timestamp: Date,
      address: String,
    },
    emergencyStatus: {
      active: Boolean,
      type: String, // "medical", "location", "other"
      message: String,
      timestamp: Date,
    },

    // Gamification
    healthGoals: [
      {
        type: String,
        target: Number,
        current: Number,
        unit: String,
        deadline: Date,
        reward: String,
        completed: Boolean,
      },
    ],
    earnedRewards: [
      {
        name: String,
        dateEarned: Date,
        type: String,
      },
    ],

    // System Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastDataSync: Date,
    dataSources: [String], // e.g., ["collar", "manual_entry", "vet_records"]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for frequently queried fields
petSchema.index({ ownerId: 1 });
petSchema.index({ collarId: 1 }, { unique: true, sparse: true });
petSchema.index({ "lastKnownLocation.coordinates": "2dsphere" });
petSchema.index({ "healthMetrics.score.current": 1 });
petSchema.index({ "emergencyStatus.active": 1 });

// Virtual for age in years (if birthDate is provided)
petSchema.virtual("ageInYears").get(function () {
  if (!this.birthDate) return null;
  const ageDiffMs = Date.now() - this.birthDate.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Middleware to update timestamps
petSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
