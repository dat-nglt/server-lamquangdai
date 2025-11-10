export const webhookController = async (req, res) => {
  const data = req.body;
  res.status(200).send("EVENT_RECEIVED");
  processData(data);
  return;
};

const processData = (data) => {
  console.log("Đã nhận sự kiện từ Zalo:", data.event_name);
  // Ví dụ: Nếu là tin nhắn text
  if (data.event_name === "user_send_text") {
    const message = data.message.text;
    const sender_id = data.sender.id;

    console.log(message, sender_id);
  }
};
