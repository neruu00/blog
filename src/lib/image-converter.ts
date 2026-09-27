/**
 * @file image-converter.ts
 * @description 업로드하기 전에 브라우저에서 이미지를 WebP로 변환한다. 서버 액션은 WebP만 받는다.
 */

/**
 * 이미지를 원본 크기 그대로 WebP로 변환한다. 이미 WebP면 그대로 반환한다.
 * @param quality - 0.0 ~ 1.0
 */
export async function convertToWebP(file: File, quality = 0.8): Promise<File> {
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

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP 변환에 실패했습니다.'));
              return;
            }

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
