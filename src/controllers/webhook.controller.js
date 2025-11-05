export const webhookController = async (req, res) => {
  return res.status(200).send("EVENT_RECEIVED");
};
