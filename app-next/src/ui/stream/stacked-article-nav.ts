import { createComponent, html } from 'barebind';

export interface StackedArticleNavProps {
  direction: 'vertical' | 'horizontal';
}

export const StackedArticleNav = createComponent(function StackedArticleNav({
  direction,
}: StackedArticleNavProps) {
  const scrollPrevious = () => {
    window.scrollTo({
      left: 0,
      top: 0,
    });
  };
  const scrollNext = () => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
    });
  };

  return html`
    <nav class=${['StackedArticleNav', direction]} role="toolbar">
      <button
        aria-title="Previous article"
        class="StackedArticleNav-Button"
        title="Previous article"
        type="button"
        @click=${scrollPrevious}
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">🔼</div>
        </div>
      </button>
      <button
        aria-title="Next article"
        class="StackedArticleNav-Button"
        title="Next article"
        type="button"
        @click=${scrollNext}
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">🔽</div>
        </div>
      </button>
      <button
        aria-title="Extract full content"
        class="StackedArticleNav-Button"
        title="Extract full content"
        type="button"
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">📃</div>
        </div>
      </button>
      <button
        aria-title="View original"
        class="StackedArticleNav-Button"
        title="View original"
        type="button"
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">🌏︎</div>
        </div>
      </button>
      <button
        aria-title="Copy URL"
        class="StackedArticleNav-Button"
        title="Copy URL"
        type="button"
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">🔗</div>
        </div>
      </button>
      <button
        aria-title="Translate article"
        class="StackedArticleNav-Button"
        title="Translate article"
        type="button"
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">🔠</div>
        </div>
      </button>
      <button
        aria-title="Show discussions"
        class="StackedArticleNav-Button"
        title="Show discussions"
        type="button"
      >
        <div aria-hidden="true" class="StackedArticleNav-Button-icon EmojiIcon" data-size="16">
          <div class="EmojiIcon-glyph">💬</div>
        </div>
      </button>
    </nav>
  `;
});
