import { makeAssistantToolUI } from "@assistant-ui/react";
import { Spinner } from "@/components/ui/spinner";

type RandomArgs = {
  result?: number;
};


const RandomToolUI = makeAssistantToolUI<RandomArgs, number>({
  toolName: "generate_random_integer",
  render: ({args, status, result}) => {
    // Workaround for streaming the intermediate results. Try taking them from the args.
    
    if (status.type === "running") {
      return (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Generating random number...</span>
          {args.result && <p className="text-sm text-gray-500">{args.result}...</p>}
        </div>
      );
    }
    else if (status.type === "incomplete" && status.reason === "error") {
      return (
        <div className="text-red-500">
          Failed to generate random number
        </div>
      );
    }
    else if (status.type === "complete") {
    return (result && (
      <div className="rounded-lg bg-blue-50 p-4 mb-4">
        <h3 className="text-lg font-bold">Random Number</h3>
        <div className="mt-2">
          <p className="text-2xl">🎉 {result}</p>
        </div>
      </div>
      )) || null;
    }
    return null;
  },
});

export default RandomToolUI;