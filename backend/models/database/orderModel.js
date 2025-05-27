import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collar',
      required: true
    },
    variant: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      color: String,
      size: String,
      stock: Number
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 1
    },
    price: Number
  }],
  pet: {
    existingPet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet'
    },
    newPet: {
      name: String,
      breed: String,
      age: Number,
      weight: Number,
      gender: {
        type: String,
        enum: ['male', 'female', 'other']
      },
      specialNeeds: String
    }
  },
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'cod'],
    required: true
  },
  shippingFee: {
    type: Number,
    default: 10.00
  },
  totalAmount: Number,
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  collarAssigned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
OrderSchema.index({ user: 1 });
OrderSchema.index({ 'pet.existingPet': 1 });
OrderSchema.index({ 'products.variant._id': 1 });

// Virtual for pet details
OrderSchema.virtual('petDetails').get(function() {
  return this.pet.existingPet || this.pet.newPet;
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;