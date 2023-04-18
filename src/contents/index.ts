import styleText from "data-text:../style.module.css"
import type { PlasmoCSConfig } from "plasmo"

import { relayMessage } from "@plasmohq/messaging"

import {
  OBSERVE_EXECUTION_LIMIT,
  RELAY_EXECUTE_ENTER,
  RELAY_GET_ZOOM_VALUE_FROM_STORAGE,
  workspaceAppUiStrategyConfigs
} from "../constants"
import DocsStrategy from "../strategies/docs"
import SheetsStrategy from "../strategies/sheets"
import counterFactory from "../utils/counter-factory"
import getCurrentApp from "../utils/get-current-app"

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

// create and "register" the relay
relayMessage({ name: RELAY_GET_ZOOM_VALUE_FROM_STORAGE })
relayMessage({ name: RELAY_EXECUTE_ENTER })

const currentApp = getCurrentApp()
let strategy

switch (currentApp) {
  case "Docs":
    strategy = new DocsStrategy(workspaceAppUiStrategyConfigs["Docs"])
    break
  case "Sheets":
    strategy = new SheetsStrategy(workspaceAppUiStrategyConfigs["Sheets"])
    break
}

if (strategy) {
  const counter = counterFactory()
  const observer = new MutationObserver((_mutationList, observer) => {
    const zoomIsDisabled = strategy.getIsZoomSelectorDisabled()
    const isExecutionCountOverLimit =
      counter.getCount() > OBSERVE_EXECUTION_LIMIT

    if (isExecutionCountOverLimit) {
      observer.disconnect()
      return
    }

    if (!zoomIsDisabled) {
      observer.disconnect()
      strategy.execute("observer")
    }

    counter.increment()
  })

  // initial kick-off
  const zoomIsDisabled = strategy.getIsZoomSelectorDisabled()

  if (zoomIsDisabled) {
    observer.observe(document.getElementById("docs-toolbar"), {
      attributes: true,
      childList: true
    })
  } else {
    strategy.execute("inline")
  }
}
