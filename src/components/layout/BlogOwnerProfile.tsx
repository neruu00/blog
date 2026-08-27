import { Github, Mail } from 'lucide-react';

import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

export default function BlogOwnerProfile() {
  return (
    <div className="flex flex-col items-center">
      {/* 이름 및 직업 */}
      <h2 className="text-lg font-bold text-gray-900">neruu00</h2>
      <p className="mt-1 text-xs text-gray-400">Developer</p>

      {/* 소셜 링크 */}
      <div className="mt-5 flex items-center gap-3">
        <Tooltip text="GitHub" position="top">
          <Button
            href="https://github.com/neruu00"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-400"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip text="Email" position="top">
          <Button
            href="mailto:dnwogus4260@naver.com"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-400"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
