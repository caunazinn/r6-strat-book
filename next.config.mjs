/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true, webpack: (c) => { c.externals = [...(c.externals || []), { canvas: 'canvas' }]; return c; } };
export default nextConfig;
