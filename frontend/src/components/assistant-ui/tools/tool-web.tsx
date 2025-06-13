import { makeAssistantToolUI } from "@assistant-ui/react";
import { Spinner } from "@/components/ui/spinner";

type WebSearchArgs = {
  search_query: string;
  result?: string;
};

const WebSearchToolUI = makeAssistantToolUI<WebSearchArgs, string>({
  toolName: "web_search",
  render: ({ args, status, result }) => {
    // Workaround for streaming the intermediate results. Try taking them from the args.
    
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2 mb-2">
          <Spinner />
          <span>Searching the web for &quot;{args.search_query}&quot;...</span>
          {args.result && (
            <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
              {args.result}...
            </div>
          )}
        </div>
      );
    }
    else if (status.type === "incomplete" && status.reason === "error") {
      return (
        <div className="text-red-500">
          Failed to search the web for &quot;{args.search_query}&quot;
        </div>
      );
    }
    else if (status.type === "complete") {      
      return result ? (
        <div className="rounded-lg bg-blue-50 p-4 mb-4">
          <h3 className="text-lg font-bold">Web Search Results</h3>
          <p className="text-sm text-gray-500 mb-3">Search term: &quot;{args.search_query}&quot;</p>
          <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      ) : null;
    }
    return null;
  },
});

export default WebSearchToolUI;
