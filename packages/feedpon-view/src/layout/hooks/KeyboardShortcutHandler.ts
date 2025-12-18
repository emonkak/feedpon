import type { CustomHookFunction } from 'barebind';
import {
  type CommandId,
  type KeyboardShortcut,
  type KeyStroke,
  Modifier,
} from 'feedpon-store';
import { ImmutableTrie } from 'state-management/collections/ImmutableTrie';

const SPECIAL_KEYS: { [key: string]: string } = {
  ' ': 'Space',
  '|': 'Bar',
  '\\': 'Bslash',
  '<': 'Lt',
};

interface KeyboardShortcutHandlerOptions {
  timeout?: number;
}

export function KeyboardShortcutHandler(
  keyboardShortcuts: KeyboardShortcut[],
  onCommandInvoke: (commandId: CommandId) => void,
  options: KeyboardShortcutHandlerOptions = {},
): CustomHookFunction<void> {
  return (context) => {
    const { timeout = 1000 } = options;

    const handleKeyDown = context.useMemo(() => {
      const keyboardShortcutTree = Iterator.from(keyboardShortcuts).reduce(
        (keyboardShortcutTree, { keyStorokes, commandId }) =>
          keyboardShortcutTree.insert(keyStorokes.map(toKeyNotion), commandId),
        ImmutableTrie.empty<string, CommandId>(),
      );
      let pendingKeys: string[] = [];
      let timer: ReturnType<typeof setTimeout> | null = null;

      return (event: KeyboardEvent) => {
        if (shouldIgnoreEvent(event)) {
          return;
        }

        if (timer != null) {
          clearTimeout(timer);
          timer = null;
        }

        const currentKey = toKeyNotion(toKeyStroke(event));
        const currentKeys = pendingKeys.concat(currentKey);
        const keyboardShortcutNode = keyboardShortcutTree.find(currentKeys);

        if (keyboardShortcutNode === undefined) {
          pendingKeys = [];
          return;
        }

        const commandId = keyboardShortcutNode.value;
        const hasNextShortcut = !keyboardShortcutNode.children.isEmpty();

        if (commandId !== undefined) {
          event.preventDefault();

          if (hasNextShortcut) {
            timer = setTimeout(() => {
              onCommandInvoke(commandId);
              timer = null;
              pendingKeys = [];
            }, timeout);
            pendingKeys = currentKeys;
          } else {
            onCommandInvoke(commandId);
            pendingKeys = [];
          }
        } else {
          pendingKeys = hasNextShortcut ? currentKeys : [];
        }
      };
    }, [keyboardShortcuts, onCommandInvoke, timeout]);

    context.useEffect(() => {
      window.addEventListener('keydown', handleKeyDown, {
        capture: true,
      });

      return () => {
        window.removeEventListener('keydown', handleKeyDown, {
          capture: true,
        });
      };
    }, []);
  };
}

function isEditableElement(element: HTMLElement): boolean {
  return (
    element.localName === 'button' ||
    element.localName === 'input' ||
    element.localName === 'select' ||
    element.localName === 'textarea' ||
    element.isContentEditable
  );
}

function isModifierKey(key: string): boolean {
  return (
    key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta'
  );
}

function shouldIgnoreEvent(event: KeyboardEvent): boolean {
  return (
    isModifierKey(event.key) ||
    (event.target instanceof HTMLElement && isEditableElement(event.target))
  );
}

function toKeyNotion(keyStroke: KeyStroke): string {
  let s = '';
  if (keyStroke.modifiers & Modifier.Shift) {
    s += 'S-';
  }
  if (keyStroke.modifiers & Modifier.Alt) {
    s += 'A-';
  }
  if (keyStroke.modifiers & Modifier.Control) {
    s += 'C-';
  }
  if (keyStroke.modifiers & Modifier.Meta) {
    s += 'C-';
  }
  s += keyStroke.key;
  return s;
}

function toKeyStroke(event: KeyboardEvent): KeyStroke {
  const key = SPECIAL_KEYS[event.key] ?? event.key;
  let modifiers = Modifier.None;
  if (event.shiftKey && key.length > 1) {
    modifiers |= Modifier.Shift;
  }
  if (event.altKey) {
    modifiers |= Modifier.Alt;
  }
  if (event.ctrlKey) {
    modifiers |= Modifier.Control;
  }
  if (event.metaKey) {
    modifiers |= Modifier.Meta;
  }
  return {
    key,
    modifiers,
  };
}
