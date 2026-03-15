'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

const TAG_DICTIONARY = [
  { name: 'Algorithm', keywords: ['알고리즘'] },
  { name: 'Frontend', keywords: ['프론트엔드', '프론트', 'fe'] },
  { name: 'Backend', keywords: ['백엔드', 'be'] },
  { name: 'Database', keywords: ['데이터베이스', 'db'] },
  { name: 'Javascript', keywords: ['자바스크립트', 'js'] },
  { name: 'Typescript', keywords: ['타입스크립트', 'ts'] },
  { name: 'React', keywords: ['리액트'] },
  { name: 'Next.js', keywords: ['넥스트'] },
  { name: 'Java', keywords: ['자바'] },
  { name: 'Python', keywords: ['파이썬'] },
  { name: 'etc', keywords: ['기타'] },
];

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInputField({ tags, onChange }: TagInputProps) {
  const [tagInput, setTagInput] = useState('');
  const [isTagFocused, setIsTagFocused] = useState(false);

  const suggestions =
    tagInput.trim() === ''
      ? TAG_DICTIONARY.filter((tag) => !tags.includes(tag.name))
      : TAG_DICTIONARY.filter((tag) => {
          if (tags.includes(tag.name)) return false;

          const searchTarget = tagInput.toLowerCase().trim();
          const matchName = tag.name.toLowerCase().includes(searchTarget);
          const matchKeyword = tag.keywords.some((keyword) => keyword.includes(searchTarget));

          return matchName || matchKeyword;
        });

  const addTag = (input: string) => {
    const exactMatch = TAG_DICTIONARY.find((t) => {
      const isNameMatch = t.name.toLowerCase() === input.trim().toLowerCase();
      const isKeywordMatch = t.keywords.includes(input.trim());
      return isNameMatch || isKeywordMatch;
    });

    if (exactMatch && !tags.includes(exactMatch.name)) {
      onChange([...tags, exactMatch.name]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (tagInput.trim() && suggestions.length > 0) {
        addTag(suggestions[0].name);
      } else {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-wrap items-center gap-2 border-b border-gray-100 pb-3 dark:border-neutral-800">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full bg-orange-50 py-1.5 pr-2 pl-3 text-sm font-medium text-orange-600 transition-colors dark:bg-orange-500/10 dark:text-orange-400"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full p-0.5 hover:bg-orange-200 hover:text-orange-800 dark:hover:bg-orange-500/20 dark:hover:text-orange-300"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}

      <input
        type="text"
        placeholder={tags.length === 0 ? '태그를 입력하고 Enter를 누르세요' : ''}
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagKeyDown}
        onFocus={() => setIsTagFocused(true)}
        onBlur={() => setIsTagFocused(false)}
        className="min-w-50 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300 dark:placeholder:text-gray-600"
      />

      {isTagFocused && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-10 mt-2 max-h-48 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {suggestions.map((tagObj) => (
            <li
              key={tagObj.name}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(tagObj.name);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-orange-400"
            >
              <span className="font-semibold">{tagObj.name}</span>
              {tagObj.keywords.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  ({tagObj.keywords[0]})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
