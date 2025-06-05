#!/usr/bin/env bun

import type { ParsedGitHubContext } from "../github/context";
import type { PreparedContext } from "./types";

/**
 * Adapter function to convert PreparedContext to ParsedGitHubContext-compatible format
 * This enables orchestrator functions to work with the existing create-prompt flow
 */
export function adaptPreparedToGitHubContext(
  preparedContext: PreparedContext,
): ParsedGitHubContext {
  // Extract the necessary fields from PreparedContext
  const { eventData } = preparedContext;

  // Create a minimal ParsedGitHubContext that contains the fields needed by orchestrator functions
  const adaptedContext: ParsedGitHubContext = {
    runId: process.env.GITHUB_RUN_ID || "",
    eventName: eventData.eventName,
    eventAction: getEventAction(eventData),
    repository: {
      owner: preparedContext.repository.split("/")[0] || "",
      repo: preparedContext.repository.split("/")[1] || "",
      full_name: preparedContext.repository,
    },
    actor: preparedContext.triggerUsername || "unknown",
    // Create minimal payload structure based on event type
    payload: createMinimalPayload(preparedContext),
    entityNumber: getEntityNumber(eventData),
    isPR: eventData.isPR,
    inputs: {
      triggerPhrase: preparedContext.triggerPhrase,
      assigneeTrigger:
        eventData.eventName === "issues" && eventData.eventAction === "assigned"
          ? eventData.assigneeTrigger
          : "",
      allowedTools: preparedContext.allowedTools || "",
      disallowedTools: preparedContext.disallowedTools || "",
      customInstructions: preparedContext.customInstructions || "",
      directPrompt: preparedContext.directPrompt || "",
      baseBranch: eventData.baseBranch,
    },
  };

  return adaptedContext;
}

/**
 * Helper function to create minimal payload structure for orchestrator functions
 */
function createMinimalPayload(preparedContext: PreparedContext): any {
  const { eventData } = preparedContext;

  switch (eventData.eventName) {
    case "issue_comment":
      return {
        comment: {
          body: eventData.commentBody,
          id: parseInt(eventData.commentId || "0"),
          user: {
            login: preparedContext.triggerUsername || "unknown",
          },
        },
        issue: {
          number: eventData.isPR
            ? parseInt(eventData.prNumber)
            : parseInt(eventData.issueNumber),
          pull_request: eventData.isPR ? {} : undefined,
        },
      };

    case "pull_request_review":
      return {
        review: {
          body: eventData.commentBody,
          user: {
            login: preparedContext.triggerUsername || "unknown",
          },
        },
        pull_request: {
          number: parseInt(eventData.prNumber),
        },
      };

    case "pull_request_review_comment":
      return {
        comment: {
          body: eventData.commentBody,
          id: parseInt(eventData.commentId || "0"),
          user: {
            login: preparedContext.triggerUsername || "unknown",
          },
        },
        pull_request: {
          number: parseInt(eventData.prNumber),
        },
      };

    case "issues":
      return {
        issue: {
          number: parseInt(eventData.issueNumber),
          body: "",
          title: "",
          user: {
            login: preparedContext.triggerUsername || "unknown",
          },
          assignee:
            eventData.eventAction === "assigned"
              ? {
                  login: eventData.assigneeTrigger,
                }
              : undefined,
        },
      };

    case "pull_request":
      return {
        pull_request: {
          number: parseInt(eventData.prNumber),
          body: "",
          title: "",
          user: {
            login: preparedContext.triggerUsername || "unknown",
          },
        },
      };

    default:
      return {};
  }
}

/**
 * Helper function to extract event action from event data
 */
function getEventAction(
  eventData: PreparedContext["eventData"],
): string | undefined {
  if (eventData.eventName === "issues") {
    return eventData.eventAction;
  } else if (eventData.eventName === "pull_request") {
    return eventData.eventAction;
  }
  return undefined;
}

/**
 * Helper function to extract entity number from event data
 */
function getEntityNumber(eventData: PreparedContext["eventData"]): number {
  if (eventData.isPR && "prNumber" in eventData) {
    return parseInt(eventData.prNumber);
  } else if (!eventData.isPR && "issueNumber" in eventData) {
    return parseInt(eventData.issueNumber);
  }
  return 0;
}

/**
 * Adapter function to check if PreparedContext has enough data for orchestrator
 * Returns true if we can safely adapt the context
 */
export function canAdaptContext(preparedContext: PreparedContext): boolean {
  const { eventData } = preparedContext;

  // Check if we have the minimum required fields
  if (!preparedContext.repository || !preparedContext.triggerPhrase) {
    return false;
  }

  // Check event-specific requirements
  switch (eventData.eventName) {
    case "issue_comment":
    case "pull_request_review_comment":
    case "pull_request_review":
      return !!eventData.commentBody;

    case "issues":
      return eventData.eventAction === "assigned"
        ? !!eventData.assigneeTrigger
        : true;

    case "pull_request":
      return true;

    default:
      return false;
  }
}
