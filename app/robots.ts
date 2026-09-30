import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://attendify.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/forgot-password"],
        disallow: ["/dashboard", "/dashboard/*", "/subjects", "/attendance", "/calculator", "/analytics", "/timetable", "/gpa", "/reports", "/settings", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}