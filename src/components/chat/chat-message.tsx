'use client';

import type { ChatMessage, ChatConfig } from '@/lib/chat-types';
import { TextMessage } from './messages/text-message';
import { StylePickerMessage } from './messages/style-picker-message';
import { GeneratingMessage } from './messages/generating-message';
import { ImageResultMessage } from './messages/image-result-message';
import { ErrorMessage } from './messages/error-message';
import { ResearchPreviewMessage } from './messages/research-preview-message';

type Props = {
  message: ChatMessage;
  config: ChatConfig;
  onSelectStyle: (styleId: string) => void;
  onSelectAspect: (aspect: string) => void;
  onToggleSimplify: () => void;
  onRegenerate: (content: string, style?: string) => void;
  onApproveResearch?: () => void;
  onEditResearch?: () => void;
};

export function ChatMessageView({
  message,
  config,
  onSelectStyle,
  onSelectAspect,
  onToggleSimplify,
  onRegenerate,
  onApproveResearch,
  onEditResearch,
}: Props) {
  switch (message.type) {
    case 'text':
      return <TextMessage message={message} />;
    case 'style-picker':
      return (
        <StylePickerMessage
          message={message}
          config={config}
          onSelectStyle={onSelectStyle}
          onSelectAspect={onSelectAspect}
          onToggleSimplify={onToggleSimplify}
        />
      );
    case 'research-preview':
      return (
        <ResearchPreviewMessage
          message={message}
          onApprove={onApproveResearch ?? (() => {})}
          onEdit={onEditResearch ?? (() => {})}
        />
      );
    case 'generating':
      return <GeneratingMessage message={message} />;
    case 'image-result':
      return <ImageResultMessage message={message} onRegenerate={onRegenerate} />;
    case 'error':
      return <ErrorMessage message={message} />;
    default:
      return null;
  }
}
