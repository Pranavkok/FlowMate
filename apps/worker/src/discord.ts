export async function sendDiscordMessage(webhookUrl: string, content: string) {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        throw new Error(`Discord webhook failed: ${res.status}`);
    }
    console.log("Discord message sent");
}
