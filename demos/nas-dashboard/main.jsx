// Mounts each figure of "The button that does nothing" into its placeholder.
import { createRoot } from 'react-dom/client';
import { Broker } from './Broker';
import { Unknown } from './Unknown';
import { Color } from './Color';
import { DeadButton } from './DeadButton';
import { ClaudeCard } from './ClaudeCard';
import './figures.css';

const figures = {
  copy: () => <Broker stage="copy" />,
  retain: () => <Broker stage="retain" />,
  will: () => <Broker stage="will" />,
  unknown: Unknown,
  color: Color,
  'dead-button': DeadButton,
  'claude-card': ClaudeCard,
};

for (const el of document.querySelectorAll('.demo[data-demo]')) {
  const Figure = figures[el.dataset.demo];
  const stage = el.querySelector('.demo-stage');
  if (Figure && stage) createRoot(stage).render(<Figure />);
}
