/**
 * @file Win95Taskbar.tsx
 * @description /portfolio 화면 아래에 고정되는 Windows 95 작업 표시줄.
 *              맨 왼쪽 버튼은 시작 버튼 자리에서 블로그 홈(/)으로 돌아가는 출구 역할을 하고,
 *              그 오른쪽에 열린 창마다 버튼을 하나씩 둔다. 누르면 그 창을 맨 앞으로 가져온다.
 */

import { Github, Mail } from 'lucide-react';

import Win95Button from '@/components/project/Win95Button';
import { FolderIcon } from '@/components/project/Win95Icons';

export interface Win95Task {
  id: string;
  title: string;
  icon: React.ReactNode;
  active: boolean;
}

interface Win95TaskbarProps {
  tasks: Win95Task[];
  onTaskClick: (id: string) => void;
  github: string;
  email: string;
}

export default function Win95Taskbar({ tasks, onTaskClick, github, email }: Win95TaskbarProps) {
  return (
    <div className="win-raised font-win fixed inset-x-0 bottom-0 z-40 flex h-10 items-center gap-1.5 px-1 text-xs text-black">
      <Win95Button href="/" aria-label="블로그로 돌아가기" className="h-8 px-2 font-bold">
        <FolderIcon size={16} />
        블로그
      </Win95Button>

      <span
        aria-hidden
        className="border-l-win-shadow mx-0.5 h-7 border-r border-l border-r-white"
      />

      <ul className="flex min-w-0 flex-1 gap-1">
        {tasks.map((task) => (
          <li key={task.id} className="min-w-0 sm:w-44">
            <Win95Button
              onClick={() => onTaskClick(task.id)}
              pressed={task.active}
              aria-pressed={task.active}
              className={`h-8 w-full justify-start px-2 ${task.active ? 'font-bold' : ''}`}
            >
              {task.icon}
              <span className="truncate">{task.title}</span>
            </Win95Button>
          </li>
        ))}
      </ul>

      <div className="win-sunken flex h-8 items-center gap-1 px-1.5">
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="p-1"
        >
          <Github className="h-4 w-4" />
        </a>
        <a href={`mailto:${email}`} aria-label="이메일" title="이메일" className="p-1">
          <Mail className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
