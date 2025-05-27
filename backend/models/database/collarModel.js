import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const collarSchema = new mongoose.Schema({
    collarId: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4
    },
    modelName: {
        type: String,
        required: true,
        trim: true
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    variants: [{
        color: {
            type: String,
            required: true,
            trim: true
        },
        size: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    status: {
        type: String,
        enum: ["available", "low stock", "out of stock"],
        default: "available"
    }
}, { 
    timestamps: true 
});

// Middleware to update status based on stock
collarSchema.pre("save", function(next) {
    const inStockVariants = this.variants.filter(variant => variant.stock > 0).length;
    
    if (inStockVariants === 0) {
        this.status = "out of stock";
    } else if (inStockVariants < this.variants.length / 2) {
        this.status = "low stock";
    } else {
        this.status = "available";
    }

    next();
});

const Collar = mongoose.model("Collar", collarSchema);

export default Collar;