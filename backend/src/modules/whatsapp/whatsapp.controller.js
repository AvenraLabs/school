import WhatsappLog from "./whatsapp-log.model.js";

/**
 * GET /api/whatsapp/webhook
 * Verification endpoint for Meta Webhook setup.
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "schooliq_whatsapp_verify_secret";

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("[WhatsApp Webhook] Verification successful.");
      return res.status(200).send(challenge);
    } else {
      console.warn("[WhatsApp Webhook] Verification failed. Token mismatch.");
      return res.sendStatus(403);
    }
  }

  return res.sendStatus(400);
};

/**
 * POST /api/whatsapp/webhook
 * Receives live status updates from Meta (sent, delivered, read, failed).
 */
export const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value && Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const wamid = statusObj.id;
              const deliveryStatus = statusObj.status; // sent, delivered, read, failed

              if (wamid) {
                const log = await WhatsappLog.findOne({ where: { wamid } });
                if (log) {
                  const updateData = { status: deliveryStatus };
                  if (statusObj.errors && statusObj.errors.length > 0) {
                    updateData.error = JSON.stringify(statusObj.errors);
                  }
                  await log.update(updateData);
                  console.log(`[WhatsApp Webhook] Updated log #${log.id} (${wamid}) status to: ${deliveryStatus}`);
                }
              }
            }
          }
        }
      }
    }

    // Always acknowledge receipt to Meta within 3 seconds
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing payload:", error);
    return res.status(200).json({ status: "ok" }); // Return 200 to prevent Meta retry loops
  }
};
