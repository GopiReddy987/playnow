using Microsoft.AspNetCore.Http;

namespace PlayNow.API.Middleware
{
    public class CorsMiddleware
    {
        private readonly RequestDelegate _next;

        public CorsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Log the request for debugging
            Console.WriteLine($"CORS Middleware: {context.Request.Method} {context.Request.Path}");
            
            // Handle preflight requests
            if (context.Request.Method == "OPTIONS")
            {
                Console.WriteLine("Handling OPTIONS preflight request");
                context.Response.Headers["Access-Control-Allow-Origin"] = "http://localhost:4200";
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin";
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                context.Response.Headers["Access-Control-Max-Age"] = "86400";
                
                context.Response.StatusCode = 200;
                await context.Response.CompleteAsync();
                return;
            }

            // Add CORS headers to all responses
            context.Response.Headers["Access-Control-Allow-Origin"] = "http://localhost:4200";
            context.Response.Headers["Access-Control-Allow-Credentials"] = "true";

            await _next(context);
        }
    }
} 