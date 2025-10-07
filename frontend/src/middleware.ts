import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('access_token')?.value;
    const currentPath = req.nextUrl.pathname;

    if (!token) {
        // ถ้าไม่มี access_token ให้ redirect ไปหน้า login
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token && currentPath === '/') {
        // ถ้ามี access_token และอยู่ที่หน้า root ('/') ให้ redirect ไป dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

// กำหนด matcher ให้ middleware ทำงานกับทุก path ที่ต้องการตรวจสอบ
export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/qr-login',
        '/qr-create-device',
        '/profile/:path*',
        '/tracking/:path*',
        '/notifications/:path*',
        '/sponsor/:path*',
        '/news/:path*',
        '/categories/:path*',
        '/ColorRangeePage/:path*',
        '/DevicePage/:path*',
    ], // Protect key app routes behind auth
};
