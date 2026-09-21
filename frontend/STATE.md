# State

## copilotStore (`src/stores/copilotStore.ts`, persist key `intelgrid.copilot.v2`)
Persist `conversations` + `activeId` only. `streamingId/isStreaming` reset on reload.
Migration v1→v2: any conversation with `domain === "identity"` resets to `"auto"` (via `migrate` + rehydrate guard).
```ts
type Role = "user" | "assistant" | "system";
type Citation = { id: string; type: "document"|"entity"|"case"; refId: string; title: string; excerpt: string };
type Domain = "auto"|"network"|"documents";
type Message = { id: string; role: Role; content: string; createdAt: string; citations?: Citation[]; attachments?: { id: string; name: string; size: number; type: string }[]; streaming?: boolean; aborted?: boolean; feedback?: "up"|"down"|null; editedAt?: string };
type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; pinned: boolean; domain: Domain; messages: Message[] };
type CopilotStore = { conversations: Conversation[]; activeId: string|null; streamingId: string|null; isStreaming: boolean;
 createConversation(): string; deleteConversation(id): void; renameConversation(id,title): void; pinConversation(id): void; duplicateConversation(id): string;
 setActive(id): void; appendMessage(cid,msg): void; appendToken(cid,mid,token): void; finishStream(cid,mid): void; abortStream(cid,mid): void;
 editUserMessage(cid,mid,newContent): void; deleteMessageAndAfter(cid,mid): void; setFeedback(cid,mid,fb): void; autoTitleFromFirstUserMessage(cid): void };
```
Auto-title: after first assistant reply, if "Untitled" → first 40 chars of first user msg + ellipsis.

## uploadStore (persist `upload-storage`)
`{ step, file, metadata, setStep, setFile, setMetadata, reset }` — refresh returns to step 2 with data.

## authStore (persist `auth-storage` + localStorage token), uiStore (sidebar, copilotOpen, copilotWidth 320–640 default 420, theme, activeDomain), graphStore (selected, filters, layout).

## Server cache (TanStack Query): entities, cases, graph, documents, conversations, admin — stale 30s, retry 1. Identity check queries removed.
