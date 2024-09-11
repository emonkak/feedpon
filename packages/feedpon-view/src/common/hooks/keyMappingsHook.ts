import type { Usable } from '@emonkak/ebit';
import * as Trie from 'feedpon-utils/Trie';

import { eventHook } from '../hooks/eventHook';

const SPECIAL_KEYS: { [key: string]: string } = {
  ' ': 'Space',
  '|': 'Bar',
  '\\': 'Bslash',
  '<': 'Lt',
};

export function keyMappingsHook(
  keyMappings: Trie.Trie<any>,
  onInvokeKeyMapping: (keyMappings: any) => void,
  timeoutLength = 1000,
): Usable<void> {
  return (context) => {
    const pendingKeys = context.useRef<string[]>([]);
    const timer = context.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDocumentKeyDown = context.use(
      eventHook((event: KeyboardEvent) => {
        if (shouldIgnoreEvent(event)) {
          return;
        }

        if (timer.current != null) {
          clearTimeout(timer.current);
          timer.current = null;
        }

        const keyNotion = toKeyNotion(event);
        const keys = [...pendingKeys.current, keyNotion];
        const node = Trie.find(keyMappings, keys);

        if (!node) {
          pendingKeys.current = [];
          return;
        }

        const mapping = node.value;
        const hasNextMapping = !Trie.isEmpty(node.children);

        if (mapping) {
          event.preventDefault();

          if (hasNextMapping) {
            timer.current = setTimeout(() => {
              onInvokeKeyMapping(mapping);
              timer.current = null;
              pendingKeys.current = [];
            }, timeoutLength);
            pendingKeys.current = keys;
          } else {
            onInvokeKeyMapping(mapping);
            pendingKeys.current = [];
          }
        } else {
          pendingKeys.current = hasNextMapping ? keys : [];
        }
      }),
    );

    context.useEffect(() => {
      document.addEventListener('keydown', handleDocumentKeyDown);

      return () => {
        document.removeEventListener('keydown', handleDocumentKeyDown);
      };
    }, []);
  };
}

function shouldIgnoreEvent(event: KeyboardEvent): boolean {
  if (isModifier(event.key)) {
    return true;
  }

  if (event.target instanceof HTMLElement) {
    const element = event.target;

    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable
    ) {
      return true;
    }
  }

  return false;
}

function isModifier(key: string): boolean {
  if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta') {
    return true;
  }
  return false;
}

function toKeyNotion(event: KeyboardEvent): string {
  const key = SPECIAL_KEYS[event.key] || event.key;
  let s = '';
  if (event.shiftKey && key.length > 1) {
    s += 'S-';
  }
  if (event.ctrlKey) {
    s += 'C-';
  }
  if (event.altKey) {
    s += 'A-';
  }
  if (event.metaKey) {
    s += 'M-';
  }
  s += key;
  return s.length > 1 ? '<' + s + '>' : s;
}
