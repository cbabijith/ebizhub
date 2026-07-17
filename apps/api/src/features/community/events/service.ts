import { EventRepository } from "./repository.js";

export class EventService {
  private repo = new EventRepository();

  async getEvents(params: {
    status?: string;
    categoryId?: string;
    branchId?: string;
    limit: number;
    offset: number;
  }) {
    return this.repo.findEvents(params);
  }

  async getEventById(id: string) {
    const event = await this.repo.findById(id);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async getPublicEventById(id: string) {
    const event = await this.getEventById(id);
    if (event.status === "cancelled" || event.endDate < new Date()) {
      throw new Error("Event not found");
    }
    return event;
  }

  async createEvent(data: any, userId: string) {
    return this.repo.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateEvent(id: string, data: any, userId: string) {
    await this.getEventById(id);
    return this.repo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

  async deleteEvent(id: string, userId: string) {
    await this.getEventById(id);
    return this.repo.delete(id, userId);
  }

  // --- Registration Services ---
  async registerForEvent(eventId: string, profileId: string) {
    const event = await this.getEventById(eventId);

    // 1. Verify Member Profile exists and is verified
    const member = await this.repo.findMemberByProfileId(profileId);
    if (!member) throw new Error("Only community members can register for events");
    if (member.verificationStatus !== "verified") {
      throw new Error("Your member profile must be verified to register for events");
    }

    // 2. Check registration deadlines
    const now = new Date();
    if (event.registrationStart && now < new Date(event.registrationStart)) {
      throw new Error("Event registration has not started yet");
    }
    if (event.registrationEnd && now > new Date(event.registrationEnd)) {
      throw new Error("Event registration has already closed");
    }
    if (now > new Date(event.startDate)) {
      throw new Error("Cannot register for an event that has already started");
    }

    // 3. Check duplicate registration
    const existing = await this.repo.getRegistration(eventId, member.id);
    if (existing) {
      throw new Error("You have already registered for this event");
    }

    // 4. Capacity validation
    if (event.maxParticipants) {
      const currentCount = await this.repo.getRegistrationCount(eventId);
      if (currentCount >= event.maxParticipants) {
        throw new Error("This event is fully booked");
      }
    }

    // 5. Create registration
    return this.repo.createRegistration({
      eventId,
      memberId: member.id,
      status: "registered",
      paymentStatus: Number(event.entryFee) > 0 ? "pending" : "free",
      createdBy: profileId,
      updatedBy: profileId,
    });
  }

  async getEventRegistrations(eventId: string) {
    await this.getEventById(eventId);
    return this.repo.getRegistrationsForEvent(eventId);
  }

  async updateRegistration(registrationId: string, status: string, userId: string) {
    return this.repo.updateRegistrationStatus(registrationId, status, userId);
  }
}
