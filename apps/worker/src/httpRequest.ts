export async function makeHttpRequest(url: string, method: string, body?: string) {
    const options: RequestInit = {
        method: method.toUpperCase(),
        headers: { "Content-Type": "application/json" },
    };
    if (body && method.toUpperCase() !== "GET") {
        options.body = body;
    }
    const res = await fetch(url, options);
    const text = await res.text();
    console.log(`HTTP ${method} ${url} → ${res.status}: ${text.slice(0, 200)}`);
}
