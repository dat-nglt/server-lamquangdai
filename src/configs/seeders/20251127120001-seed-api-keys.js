/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const apiKeysData = [
    {
      api_key: "AIzaSyC8SrYclm2PScOKFZNh6cv0rdfx5rVFZKg",
      model: "gemini-2.5-pro",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      api_key: "AIzaSyC8SrYclm2PScOKFZNh6cv0rdfx5rVFZKg",
      model: "gemini-2.5-flash",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      api_key: "AIzaSyC8SrYclm2PScOKFZNh6cv0rdfx5rVFZKg",
      model: "gemini-2.5-flash-lite",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      api_key: "AIzaSyDvOh48_MNFshBs8m8YdVVPA7hl_WArT5E",
      model: "gemini-2.5-pro",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      api_key: "AIzaSyDvOh48_MNFshBs8m8YdVVPA7hl_WArT5E",
      model: "gemini-2.5-flash",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      api_key: "AIzaSyDvOh48_MNFshBs8m8YdVVPA7hl_WArT5E",
      model: "gemini-2.5-flash-lite",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await queryInterface.bulkInsert("api_keys", apiKeysData, {});
  console.log("✅ Seeded api_keys table with Gemini API keys");
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete("api_keys", null, {});
  console.log("❌ Emptied api_keys table");
};