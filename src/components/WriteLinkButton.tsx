import { PenBox } from 'lucide-react';
import Link from 'next/link';

import Tooltip from './Tooltip';

export default function WriteLinkButton() {
  return (
    <Link href="/write" className="fixed right-6 bottom-6">
      <Tooltip content="글쓰기">
        <div className="rounded-full bg-orange-500 p-4 hover:bg-orange-600 active:bg-orange-700">
          <PenBox color="white" />
        </div>
      </Tooltip>
    </Link>
  );
}
