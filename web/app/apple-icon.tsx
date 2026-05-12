import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          background: 'linear-gradient(135deg, #1b2d4f 0%, #2a4a7f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 110,
        }}
      >
        👶
      </div>
    ),
    { ...size }
  );
}
