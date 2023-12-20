import React, {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';

import useEvent from '../hooks/useEvent';

interface TreeProps<T> {
  children?: React.ReactNode;
  selectedValue: T;
  onSelect: (value: T) => void;
}

interface TreeBranchProps<T> extends TreeNodeProps<T> {
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

interface TreeLeafProps<T> extends TreeNodeProps<T> {
  icon?: React.ReactNode;
}

interface TreeNodeProps<T> {
  isImportant?: boolean;
  primaryText: string;
  secondaryText?: string;
  value: T;
}

interface TreeContext {
  selectedValue: any;
  delegate: (value: any) => void;
}

const TreeContext = createContext<TreeContext | null>(null);

export function Tree<T>({ children, selectedValue, onSelect }: TreeProps<T>) {
  return (
    <TreeContext.Provider value={{ selectedValue, delegate: onSelect }}>
      <ol className="tree is-expanded">{children}</ol>
    </TreeContext.Provider>
  );
}

export function TreeBranch<T>({
  children,
  defaultExpanded = false,
  isImportant = false,
  primaryText,
  secondaryText,
  value,
}: TreeBranchProps<T>) {
  const isUserInteraction = useRef(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { selectedValue, delegate } = useContext(TreeContext)!;

  const handleExpand = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();
    setIsExpanded((isExpanded) => !isExpanded);
    isUserInteraction.current = true;
  });

  const handleSelect = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();
    delegate(value);
  });

  const shouldExpand = useMemo(() => {
    return Children.toArray(children).some((child) =>
      containsSelectedNode(child, selectedValue),
    );
  }, [children, selectedValue]);

  if (isUserInteraction.current) {
    isUserInteraction.current = false;
  } else {
    if (!isExpanded && shouldExpand) {
      setIsExpanded(true);
    }
  }

  return (
    <li>
      <div
        className={classnames('tree-node', {
          'is-important': isImportant,
          'is-selected': value === selectedValue,
        })}
      >
        <a className="tree-node-icon" href="#" onClick={handleExpand}>
          {isExpanded ? (
            <i className="icon icon-16 icon-angle-down" />
          ) : (
            <i className="icon icon-16 icon-angle-right" />
          )}
        </a>
        <a className="tree-node-label" href="#" onClick={handleSelect}>
          <span className="tree-node-primary-text">{primaryText}</span>
          <span className="tree-node-secondary-text">{secondaryText}</span>
        </a>
      </div>
      <ol className={classnames('tree', { 'is-expanded': isExpanded })}>
        {children}
      </ol>
    </li>
  );
}

export function TreeLeaf<T>({
  isImportant = false,
  icon,
  primaryText,
  secondaryText,
  value,
}: TreeLeafProps<T>) {
  const { selectedValue, delegate } = useContext(TreeContext)!;

  const handleSelect = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();
    delegate(value);
  });

  return (
    <li>
      <a
        className={classnames('tree-node', {
          'is-important': isImportant,
          'is-selected': value === selectedValue,
        })}
        href="#"
        onClick={handleSelect}
      >
        {icon ? <span className="tree-node-icon">{icon}</span> : null}
        <span className="tree-node-label">
          <span className="tree-node-primary-text">{primaryText}</span>
          <span className="tree-node-secondary-text">{secondaryText}</span>
        </span>
      </a>
    </li>
  );
}

function containsSelectedNode(
  child: React.ReactNode,
  selectedValue: any,
): boolean {
  if (isValidElement(child)) {
    const type = child.type as any;
    if (type === TreeLeaf) {
      return (child.props as TreeLeafProps<unknown>).value === selectedValue;
    }
    if (type === TreeBranch) {
      return Children.toArray(
        (child.props as TreeBranchProps<unknown>).children,
      ).some(containsSelectedNode);
    }
  }
  return false;
}
