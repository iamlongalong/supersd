export interface Tag {
  id: number
  nameCh: string
  nameEng: string
}

export interface DictClass {
  id: number
  name: string
  label: string
  contents: Array<Tag>
}

export interface TagDict {
  name: string
  label: string
  classes: Map<string, DictClass>
}

export enum Language {
  Chinese = 'chinese',
  English = 'english',
  Both = 'both'
}

export interface SelectedTag extends Tag {
  enhance: number
  language: Language
}

export interface SavedTags {
  timestamp: number
  selectedTags: Array<SelectedTag>
}
