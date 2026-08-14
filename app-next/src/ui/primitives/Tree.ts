import { createComponent, html, type VComponent } from 'barebind';

const enum OpenStatus {
  NEUTRAL,
  OPENED,
  CLOSED,
}

export interface TreeProps {
  children: VComponent<TreeNodeProps>[];
}

export interface TreeNodeProps {
  children?: VComponent<TreeNodeProps>[];
  content: unknown;
  href: string;
  selected: boolean;
}

export const Tree = createComponent(function Tree({ children }: TreeProps) {
  return html`
    <ul class="Tree">
      <${children}>
    </ul>
  `;
});

export const TreeNode = createComponent(function TreeNode({
  children,
  content,
  href,
  selected,
}: TreeNodeProps) {
  const [openStatus, setOpenStatus] = this.useState(OpenStatus.NEUTRAL);
  const selectedKey = children?.find(isSelected)?.key;
  const opened = shouldOpen(openStatus, selectedKey);
  const toggle = () => {
    setOpenStatus(
      selectedKey !== undefined
        ? opened
          ? OpenStatus.CLOSED
          : OpenStatus.NEUTRAL
        : opened
          ? OpenStatus.NEUTRAL
          : OpenStatus.OPENED,
    );
  };

  return html`
    <li class=${['TreeNode', { selected }]}>
      <${
        children !== undefined
          ? html`
            <button
              @click=${toggle}
              aria-expanded=${opened.toString()}
              class=${['TreeNode-Toggle', { opened }]}
            >
            </button>
          `
          : null
      }>
      <a class="TreeNode-Cell" href=${href}>
        <${content}>
      </a>
      <${
        opened
          ? html`
            <div class="TreeNode-Children">
              <ul class="Tree">
                <${children}>
              </ul>
            </div>
          `
          : null
      }>
    </li>
  `;
});

function isSelected(element: VComponent<TreeNodeProps>): boolean {
  const { selected, children } = element.props;
  return selected ? true : (children?.some(isSelected) ?? false);
}

function shouldOpen(status: OpenStatus, selectedKey: unknown): boolean {
  switch (status) {
    case OpenStatus.OPENED:
      return true;
    case OpenStatus.CLOSED:
      return false;
    case OpenStatus.NEUTRAL:
      return selectedKey !== undefined;
  }
}
