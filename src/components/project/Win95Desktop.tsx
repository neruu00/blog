/**
 * @file Win95Desktop.tsx
 * @description /portfolio 바탕화면 아이콘. about 앱은 소개 창을, project 폴더는 프로젝트 앱 목록 창을 연다.
 */

import Win95IconLink from '@/components/project/Win95IconLink';
import { FolderIcon, ProfileAppIcon } from '@/components/project/Win95Icons';

export default function Win95Desktop() {
  return (
    <nav
      aria-label="바탕화면"
      className="absolute top-2 left-2 flex flex-col gap-3 sm:top-8 sm:left-4"
    >
      <Win95IconLink href="/portfolio/about" icon={<ProfileAppIcon size={48} />} label="about" />
      <Win95IconLink href="/portfolio/project" icon={<FolderIcon size={48} />} label="project" />
    </nav>
  );
}
