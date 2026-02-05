import {
  createComponent,
  type RenderContext,
  Repeat,
  shallowEqual,
} from 'barebind';
import { type KeyboardShortcut, type KeyStroke, Modifier } from 'feedpon-store';

interface KeyboardShortcutTableProps {
  keyboardShortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutTable = createComponent(function KeyMappingsTable(
  { keyboardShortcuts }: KeyboardShortcutTableProps,
  $: RenderContext,
): unknown {
  const rows = Repeat({
    elementSelector: (keyboardShortcut) => {
      return $.html`
        <tr>
          <td>
            <${Repeat({
              elementSelector: (keyStroke) => KeyStrokeView({ keyStroke }),
              source: keyboardShortcut.keyStorokes,
            })}>
          </td>
          <td>${keyboardShortcut.commandId}</td>
        </tr>
      `;
    },
    source: keyboardShortcuts,
  });

  return $.html`
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

const KeyStrokeView = createComponent(
  function KeyStrokeView(
    { keyStroke }: KeyStrokeProps,
    $: RenderContext,
  ): unknown {
    const shift =
      keyStroke.modifiers & Modifier.Shift ? $.html`<kbd>Shift</kbd>-` : null;
    const alt =
      keyStroke.modifiers & Modifier.Alt ? $.html`<kbd>Alt</kbd>-` : null;
    const control =
      keyStroke.modifiers & Modifier.Control
        ? $.html`<kbd>Control</kbd>-`
        : null;
    const meta =
      keyStroke.modifiers & Modifier.Meta ? $.html`<kbd>Meta</kbd>-` : null;

    return $.html`
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
