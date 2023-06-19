export { sendMessage, onMessage } from './utils'

export enum SDEvents {
  SavingPrompts = 'SavingPrompts',
  GetPromptsUserHist = 'GetPromptsUserHist',
  GetPromptsAutoHist = 'GetPromptsAutoHist',
  DeletePromptsHist = 'DeletePromptsHist'
}
