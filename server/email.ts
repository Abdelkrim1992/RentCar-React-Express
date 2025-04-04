import nodemailer from 'nodemailer';
import { Booking } from './types';

// Configure nodemailer transport
// For production, you would use actual SMTP credentials
// For development/testing, we'll use a preview service that captures emails
let transporter: nodemailer.Transporter;

// Initialize the email transporter based on the environment
const initializeTransporter = () => {
  // Load environment variables directly from process.env to ensure we get the latest values
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = process.env.SMTP_PORT;
  const smtpSecure = process.env.SMTP_SECURE;
  
  console.log('SMTP Config Check:', { 
    host: smtpHost ? 'Set' : 'Not set',
    user: smtpUser ? 'Set' : 'Not set', 
    pass: smtpPass ? 'Set' : 'Not set',
    port: smtpPort
  });
  
  // Check if we have SMTP settings in the environment variables
  if (smtpHost && smtpUser && smtpPass) {
    // Real SMTP server configuration
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpSecure === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log(`Email transporter configured with ${smtpHost} SMTP server on port ${smtpPort}`);
  } else {
    // Use a preview service for development (ethereal.email)
    console.log('No SMTP credentials found, using ethereal.email for preview');
    nodemailer.createTestAccount().then(account => {
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      console.log('Preview email account created:', account.user);
      console.log('Preview URL will be displayed when emails are sent');
    }).catch(err => {
      console.error('Failed to create test email account:', err);
    });
  }
};

// Initialize the transporter when this module is loaded
initializeTransporter();

// Email templates for different booking statuses
const getEmailTemplate = (booking: Booking, status: string, reason?: string) => {
  // Handle both null and undefined for car field
  const carName = booking.car ? booking.car.name : booking.carType;
  const pickupDate = new Date(booking.pickupDate).toLocaleDateString();
  const returnDate = new Date(booking.returnDate).toLocaleDateString();
  
  switch (status) {
    case 'accepted':
      return {
        subject: `Your Car Rental Booking #${booking.id} has been Confirmed`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
            <p>Dear ${booking.name},</p>
            <p>Great news! Your car rental booking has been <strong>accepted</strong>.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Car:</strong> ${carName}</p>
              ${booking.city ? `<p><strong>City:</strong> ${booking.city}</p>` : ''}
              <p><strong>Pick-up:</strong> ${booking.pickupLocation} on ${pickupDate}</p>
              <p><strong>Return:</strong> ${booking.returnLocation} on ${returnDate}</p>
            </div>
            <p>Please arrive at the pick-up location at your scheduled time with your ID and payment method.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for choosing our car rental service!</p>
            <p>Best regards,<br>The Car Rental Team</p>
          </div>
        `
      };
    
    case 'rejected':
      return {
        subject: `Your Car Rental Booking #${booking.id} Status Update`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F44336;">Booking Update</h2>
            <p>Dear ${booking.name},</p>
            <p>We regret to inform you that your car rental booking has been <strong>declined</strong>.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Car:</strong> ${carName}</p>
              ${booking.city ? `<p><strong>City:</strong> ${booking.city}</p>` : ''}
              <p><strong>Pick-up:</strong> ${booking.pickupLocation} on ${pickupDate}</p>
              <p><strong>Return:</strong> ${booking.returnLocation} on ${returnDate}</p>
            </div>
            <p>We encourage you to try booking a different car or date range.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br>The Car Rental Team</p>
          </div>
        `
      };
      
    default:
      return {
        subject: `Your Car Rental Booking #${booking.id} Status Update`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Booking Status Update</h2>
            <p>Dear ${booking.name},</p>
            <p>Your car rental booking status has been updated to: <strong>${status}</strong>.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> #${booking.id}</p>
              <p><strong>Car:</strong> ${carName}</p>
              ${booking.city ? `<p><strong>City:</strong> ${booking.city}</p>` : ''}
              <p><strong>Pick-up:</strong> ${booking.pickupLocation} on ${pickupDate}</p>
              <p><strong>Return:</strong> ${booking.returnLocation} on ${returnDate}</p>
            </div>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for choosing our car rental service!</p>
            <p>Best regards,<br>The Car Rental Team</p>
          </div>
        `
      };
  }
};

// Send an email notification based on booking status change
export const sendBookingStatusEmail = async (booking: Booking, status: string): Promise<boolean> => {
  // Don't send if there's no email address
  if (!booking.email) {
    console.warn(`Could not send email notification: no email address for booking #${booking.id}`);
    return false;
  }

  // Don't send if the transporter isn't initialized
  if (!transporter) {
    console.warn('Email transporter not initialized yet');
    return false;
  }

  try {
    // Convert null to undefined to satisfy type checking
    const rejectionReason = booking.rejectionReason === null ? undefined : booking.rejectionReason;
    const { subject, html } = getEmailTemplate(booking, status, rejectionReason);
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Car Rental Service" <noreply@carrentalservice.com>',
      to: booking.email,
      subject,
      html
    });

    console.log(`Email sent: ${info.messageId}`);
    
    // If using ethereal.email for preview, log the URL
    if (info.messageId && info.messageId.includes('ethereal.email')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};