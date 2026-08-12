export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = process.env.ANIME_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("ANIME_API_BASE_URL environment variable is not set");
  }
  
  const url = `${baseUrl}${endpoint}`;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${url}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}
