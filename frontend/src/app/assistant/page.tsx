"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import RandomToolUI from "@/components/assistant-ui/tools/tool-random";
import WebSearchToolUI from "@/components/assistant-ui/tools/tool-web";

export default function Assistant() {
  
  return (
      <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
        <RandomToolUI />
        <WebSearchToolUI />
      </div>
  );
};
