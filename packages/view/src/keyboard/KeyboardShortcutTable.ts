import {
  type KeyboardShortcut,
  type KeyStroke,
  Modifier,
} from '@feedpon/model';
import { createComponent, html, shallowEqual } from 'barebind';

interface KeyboardShortcutTableProps {
  keyboardShortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutTable =
  createComponent<KeyboardShortcutTableProps>(function KeyboardShortcutTable({
    keyboardShortcuts,
  }) {
    const rows = keyboardShortcuts.map((keyboardShortcut) => {
      return html`
        <tr>
          <td>
            <${keyboardShortcut.keyStrokes.map((keyStroke) =>
              KeyStrokeView({ keyStroke }),
            )}>
          </td>
          <td>${keyboardShortcut.commandId}</td>
        </tr>
      `;
    });

    return html`
      <table class="table">
        <thead>
          <tr>
            <th>Key Strokes</th>
            <th>Command</th>
          </tr>
        </thead>
        <tbody><${rows}></tbody>
      </table>
    `;
  });

interface KeyStrokeProps {
  keyStroke: KeyStroke;
}

const KeyStrokeView = createComponent<KeyStrokeProps>(
  function KeyStrokeView({ keyStroke }) {
    const shift =
      keyStroke.modifiers & Modifier.Shift ? html`<kbd>Shift</kbd>-` : null;
    const alt =
      keyStroke.modifiers & Modifier.Alt ? html`<kbd>Alt</kbd>-` : null;
    const control =
      keyStroke.modifiers & Modifier.Control ? html`<kbd>Control</kbd>-` : null;
    const meta =
      keyStroke.modifiers & Modifier.Meta ? html`<kbd>Meta</kbd>-` : null;

    return html`
      <span class="KeyStroke">
        <${meta}>
        <${control}>
        <${alt}>
        <${shift}>
        <kbd>${keyStroke.key}</kbd>
      </span>
    `;
  },
  { arePropsEqual: shallowEqual },
);
