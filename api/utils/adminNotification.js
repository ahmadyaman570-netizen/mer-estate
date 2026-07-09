import Notification from "../models/notification.model.js";
import nodemailer from "nodemailer";

const isEmailEnabled = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL
  );

const sendAdminEmail = async (listing) => {
  if (!isEmailEnabled()) {
    console.warn("Admin email skipped: SMTP settings are missing");
    return;
  }

  const appUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const adminUrl = `${appUrl.replace(/\/$/, "")}/admin`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New estate pending approval: ${listing.name}`,
    text: [
      "A new estate was submitted and is waiting for admin approval.",
      "",
      `Name: ${listing.name}`,
      `Address: ${listing.address}`,
      `Price: $${Number(listing.regularPrice).toLocaleString()}`,
      "",
      `Open admin dashboard: ${adminUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">New estate waiting for approval</h2>
        <p>A new estate was submitted and needs admin approval.</p>
        <ul>
          <li><strong>Name:</strong> ${listing.name}</li>
          <li><strong>Address:</strong> ${listing.address}</li>
          <li><strong>Price:</strong> $${Number(
            listing.regularPrice
          ).toLocaleString()}</li>
        </ul>
        <p>
          <a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:white;padding:10px 14px;text-decoration:none;border-radius:8px">
            Open admin dashboard
          </a>
        </p>
      </div>
    `,
  });
};

export const notifyAdminNewListing = async (listing) => {
  await Notification.create({
    type: "new-listing",
    title: "New estate waiting for approval",
    message: `${listing.name} was submitted and needs admin approval.`,
    listingRef: listing._id,
    userRef: listing.userRef,
  });

  await sendAdminEmail(listing);
};
