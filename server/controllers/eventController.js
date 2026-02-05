import Event from '../models/eventModel.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, allDay, color, reminders } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const event = await Event.create({
      title,
      description: description || '',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      allDay: allDay || false,
      color: color || 'blue',
      reminders: reminders || [],
      userId: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// Get all events for user (with optional date range)
export const getEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// Get single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, allDay, color, reminders } = req.body;

    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (date) event.date = new Date(date);
    if (endDate !== undefined) event.endDate = endDate ? new Date(endDate) : null;
    if (allDay !== undefined) event.allDay = allDay;
    if (color) event.color = color;
    if (reminders) {
      // Reset sent status for new/modified reminders
      event.reminders = reminders.map(r => ({
        ...r,
        sent: false
      }));
    }

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};
