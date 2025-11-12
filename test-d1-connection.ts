import "dotenv/config";

async function testD1Connection() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN;

  console.log("Account ID:", accountId);
  console.log("Database ID:", databaseId);
  console.log("Token:", token ? "***" + token.slice(-4) : "NOT SET");

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "SELECT * FROM workflows LIMIT 5",
      }),
    });

    console.log("\nResponse status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("\nFull Response:", JSON.stringify(data, null, 2));

    if (data.result && data.result[0]) {
      console.log("\nFirst result:", JSON.stringify(data.result[0], null, 2));
      console.log("\nResults array:", data.result[0].results);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testD1Connection();

