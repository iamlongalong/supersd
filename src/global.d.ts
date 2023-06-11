declare const __DEV__: boolean

declare module '*.vue' {
  const component: any
  export default component
}

declare interface Tag {
  id: number
  nameCh: string
  nameEng: string
}

declare interface DictClass {
  id: number
  name: string
  label: string
  contents: Array<Tag>
}

declare interface TagDict {
  name: string
  label: string
  classes: Map<string, DictClass>
}

declare enum Language {
  Chinese = 'chinese',
  English = 'english'
}

declare interface SelectedTag extends Tag {
  enhance: number
}

