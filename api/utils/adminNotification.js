import twilio from "twilio";

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const getNotificationSender = (channel) => {
  if (channel === "whatsapp") {
    return process.env.TWILIO_FROM_WHATSAPP
      ? `whatsapp:${process.env.TWILIO_FROM_WHATSAPP}`
      : "";
  }

  return process.env.TWILIO_FROM_SMS || "";
};

const getNotificationReceiver = (channel) => {
  if (channel === "whatsapp") {
    return process.env.ADMIN_NOTIFY_WHATSAPP
      ? `whatsapp:${process.env.ADMIN_NOTIFY_WHATSAPP}`
      : "";
  }

  return process.env.ADMIN_NOTIFY_PHONE || "";
};

export const notifyAdminNewListing = async (listing) => {
  const channel =
    process.env.ADMIN_NOTIFY_CHANNEL === "whatsapp" ? "whatsapp" : "sms";
  const client = getTwilioClient();
  const from = getNotificationSender(channel);
  const to = getNotificationReceiver(channel);

  if (!client || !from || !to) {
    console.warn(
      "Admin notification skipped: Twilio or admin phone settings are missing"
    );
    return;
  }

  const appUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const adminUrl = `${appUrl.replace(/\/$/, "")}/admin`;

  await client.messages.create({
    from,
    to,
    body: [
      "New estate is waiting for approval.",
      `Name: ${listing.name}`,
      `Address: ${listing.address}`,
      `Price: $${Number(listing.regularPrice).toLocaleString()}`,
      `Approve from: ${adminUrl}`,
    ].join("\n"),
  });
};
