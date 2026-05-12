import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1b2d4f 0%, #2a4a7f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}
      >
        👶
      </div>
    ),
    { ...size }
  );
}
