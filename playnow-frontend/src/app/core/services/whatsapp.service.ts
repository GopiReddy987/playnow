import { Injectable } from '@angular/core';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

export interface BookingNotification {
  playerName: string;
  sport: string;
  turf: string;
  date: string;
  time: string;
  duration: number;
  teamSize: number;
  totalCost: number;
  bookingId: string;
}

export interface MatchNotification {
  matchTitle: string;
  sport: string;
  turf: string;
  date: string;
  time: string;
  duration: string;
  hostName: string;
  playersNeeded: number;
  pricePerPlayer: number;
  matchId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  // Default admin phone number for notifications
  private readonly adminPhone = '+919876543210'; // Replace with actual admin number
  private readonly businessPhone = '+919876543211'; // Replace with actual business number

  constructor() { }

  /**
   * Send booking confirmation via WhatsApp
   */
  sendBookingConfirmation(booking: BookingNotification, userPhone?: string): void {
    const message = this.formatBookingMessage(booking);
    
    if (userPhone) {
      // Send to user
      this.sendWhatsAppMessage(userPhone, message);
    }
    
    // Send to admin/business
    this.sendWhatsAppMessage(this.adminPhone, `📋 New Booking Received!\n\n${message}`);
  }

  /**
   * Send match creation notification via WhatsApp
   */
  sendMatchCreationNotification(match: MatchNotification, userPhone?: string): void {
    const message = this.formatMatchMessage(match);
    
    if (userPhone) {
      // Send to user
      this.sendWhatsAppMessage(userPhone, message);
    }
    
    // Send to admin/business
    this.sendWhatsAppMessage(this.adminPhone, `🏟️ New Match Created!\n\n${message}`);
  }

  /**
   * Send match join notification
   */
  sendMatchJoinNotification(match: MatchNotification, playerName: string, userPhone?: string): void {
    const message = `🎯 Match Join Confirmation!\n\n` +
      `Player: ${playerName}\n` +
      `Match: ${match.matchTitle}\n` +
      `Sport: ${match.sport}\n` +
      `Date: ${match.date} at ${match.time}\n` +
      `Venue: ${match.turf}\n` +
      `Host: ${match.hostName}\n\n` +
      `✅ You have successfully joined this match!\n` +
      `💰 Cost: ₹${match.pricePerPlayer}\n\n` +
      `📱 Contact host for more details\n` +
      `🎮 See you on the field!`;

    if (userPhone) {
      this.sendWhatsAppMessage(userPhone, message);
    }
    
    // Notify host about new player
    this.sendWhatsAppMessage(this.adminPhone, `👤 New Player Joined!\n\n${message}`);
  }

  /**
   * Send reminder notification
   */
  sendMatchReminder(match: MatchNotification, userPhone: string): void {
    const message = `⏰ Match Reminder!\n\n` +
      `🏟️ ${match.matchTitle}\n` +
      `📅 Today at ${match.time}\n` +
      `🏟️ ${match.turf}\n` +
      `👥 ${match.playersNeeded} players needed\n` +
      `💰 ₹${match.pricePerPlayer}/player\n\n` +
      `🎯 Don't forget your match!\n` +
      `📱 Contact host if you need to cancel`;

    this.sendWhatsAppMessage(userPhone, message);
  }

  /**
   * Format booking message for WhatsApp
   */
  private formatBookingMessage(booking: BookingNotification): string {
    return `📋 Booking Confirmation!\n\n` +
      `🎯 Sport: ${booking.sport}\n` +
      `👤 Player: ${booking.playerName}\n` +
      `🏟️ Turf: ${booking.turf}\n` +
      `📅 Date: ${booking.date}\n` +
      `⏰ Time: ${booking.time}\n` +
      `⏱️ Duration: ${booking.duration} hour(s)\n` +
      `👥 Team Size: ${booking.teamSize} players\n` +
      `💰 Total Cost: ₹${booking.totalCost}\n` +
      `🆔 Booking ID: ${booking.bookingId}\n\n` +
      `✅ Your booking has been confirmed!\n` +
      `📱 We'll send you a reminder before the match\n` +
      `🎮 Have a great game!`;
  }

  /**
   * Format match creation message for WhatsApp
   */
  private formatMatchMessage(match: MatchNotification): string {
    return `🏟️ Match Created Successfully!\n\n` +
      `🎯 ${match.matchTitle}\n` +
      `⚽ Sport: ${match.sport}\n` +
      `🏟️ Venue: ${match.turf}\n` +
      `📅 Date: ${match.date}\n` +
      `⏰ Time: ${match.time}\n` +
      `⏱️ Duration: ${match.duration}\n` +
      `👤 Host: ${match.hostName}\n` +
      `👥 Players Needed: ${match.playersNeeded}\n` +
      `💰 Price: ₹${match.pricePerPlayer}/player\n` +
      `🆔 Match ID: ${match.matchId}\n\n` +
      `✅ Your match is now live!\n` +
      `📱 Players can join through the app\n` +
      `🎮 Good luck with your game!`;
  }

  /**
   * Send WhatsApp message using WhatsApp Web API
   */
  private sendWhatsAppMessage(phone: string, message: string): void {
    // Remove any non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new window/tab
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Get WhatsApp sharing URL for match
   */
  getMatchShareUrl(match: MatchNotification): string {
    const message = `🏟️ Join my match!\n\n` +
      `🎯 ${match.matchTitle}\n` +
      `⚽ ${match.sport}\n` +
      `📅 ${match.date} at ${match.time}\n` +
      `🏟️ ${match.turf}\n` +
      `👥 ${match.playersNeeded} players needed\n` +
      `💰 ₹${match.pricePerPlayer}/player\n\n` +
      `🎮 Join now on PlayNow!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * Get WhatsApp sharing URL for booking
   */
  getBookingShareUrl(booking: BookingNotification): string {
    const message = `📋 I just booked a game!\n\n` +
      `🎯 ${booking.sport}\n` +
      `🏟️ ${booking.turf}\n` +
      `📅 ${booking.date} at ${booking.time}\n` +
      `⏱️ ${booking.duration} hour(s)\n` +
      `👥 ${booking.teamSize} players\n` +
      `💰 ₹${booking.totalCost}\n\n` +
      `🎮 Join me on PlayNow!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  }
} 