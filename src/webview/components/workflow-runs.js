import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  useAccordionItemContext,
} from "@reach/accordion";
import "@reach/accordion/styles.css";
import { formatRelative } from "date-fns";
import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";

import { useRun, useWorkflowRuns } from "../hooks";
import { capitalize } from "../lib";
import { Spinner } from "./spinner";

function makeWorkflowLabel(run) {
  const relativeDate = formatRelative(Date.parse(run.created_at), new Date());
  return `${run.conclusion === "success" ? "✅" : "💥"} ${capitalize(
    relativeDate
  )}`;
}

function RunDetails({ id }) {
  const { isExpanded } = useAccordionItemContext();
  const { data, isLoading, isSuccess, isIdle } = useRun(id, {
    enabled: isExpanded,
  });

  return (
    <React.Fragment>
      {isIdle && <div>Waiting to be opened..</div>}
      {isLoading && (
        <Spinner>
          Loading run <strong>{id}</strong>...
        </Spinner>
      )}
      {isSuccess && data && (
        <div className="h-64 overflow-auto p-2">
          <pre className="font-mono">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </React.Fragment>
  );
}

function CustomAccordionButton({ run }) {
  const { isExpanded } = useAccordionItemContext();
  return (
    <AccordionButton className="w-full text-left h-8 focus:outline-none focus:ring">
      <div className="flex items-center justify-between">
        {makeWorkflowLabel(run)}
        <span className="opacity-40">
          {isExpanded ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )}
        </span>
      </div>
    </AccordionButton>
  );
}

export function WorkflowRuns() {
  const { data, isLoading, isSuccess } = useWorkflowRuns();

  if (isLoading) {
    return <Spinner>Loading...</Spinner>;
  }

  if (isSuccess && data) {
    const { workflow_runs, total_count } = data;
    return (
      <div className="space-y-2">
        <p>
          Total Runs: <strong>{total_count}</strong>
        </p>
        <hr className="opacity-20" />
        <Accordion>
          <div className="space-y-1">
            {workflow_runs.map((run) => {
              return (
                <AccordionItem key={run.id}>
                  <CustomAccordionButton run={run} />
                  <AccordionPanel>
                    <RunDetails id={run.id} />
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </div>
        </Accordion>
      </div>
    );
  }

  return null;
}
