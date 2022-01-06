import fetch from "node-fetch";

export async function fetchJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
}
