/**
 * @file image-converter.ts
 * @description 클라이언트 측 이미지 변환 유틸리티.
 *              이미지를 WebP 형식으로 변환하여 용량을 최적화한다.
 */

/**
 * 이미지를 WebP 형식으로 변환합니다.
 * @param file - 원본 이미지 파일
 * @param quality - 변환 품질 (0.0 ~ 1.0, 기본값 0.8)
 * @returns WebP로 변환된 File 객체
 */
export async function convertToWebP(file: File, quality = 0.8): Promise<File> {
  // 이미 WebP인 경우 변환 과정 없이 그대로 반환
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0);

        // WebP 형식으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP 변환에 실패했습니다.'));
              return;
            }

            // 파일명 확장자를 .webp로 변경
            const originalName = file.name;
            const fileNameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            const fileName = `${fileNameWithoutExt || 'image'}.webp`;

            const convertedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(convertedFile);
          },
          'image/webp',
          quality,
        );
      };
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    reader.readAsDataURL(file);
  });
}
