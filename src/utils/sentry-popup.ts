import * as Sentry from "@sentry/react"
import type { ExtensionFileSource } from "../types"
import { sentryConfig } from "./sentry/config"

export const setupSentry = (source: ExtensionFileSource) => {
  Sentry.init(sentryConfig)

  Sentry.configureScope((scope) => {
    scope.setTags({ source })
  })

  return Sentry.ErrorBoundary
}
