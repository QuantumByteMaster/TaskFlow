import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'push', 'both'],
    default: 'email'
  },
  timeBefore: {
    type: Number, // minutes before event
    required: true,
    default: 30
  },
  sent: {
    type: Boolean,
    default: false
  }
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    allDay: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'blue',
      enum: ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'teal']
    },
    reminders: [reminderSchema],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Index for efficient queries
eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ 'reminders.sent': 1, date: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
