import type { NextConfig } from "next";

const securityHeaders = [
  // 防止網站被嵌入 iframe（點擊劫持防護）
  { key: "X-Frame-Options", value: "DENY" },
  // 禁止瀏覽器猜測 MIME 類型
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 控制 Referrer 外洩
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 禁用不需要的瀏覽器權限
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // 內容安全政策：只允許自家資源與內聯樣式（Tailwind 需要）
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
