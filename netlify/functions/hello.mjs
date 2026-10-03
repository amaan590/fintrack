export default async (req) => {
    return new Response(JSON.stringify({ message: "Hello from the backend!"}), {
        headers: { "Content-Type": "application/json" }
    });    
}