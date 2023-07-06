export interface IGroup {
  active: boolean,
  title: string,
  id: number,
  timers: number[],
}
  
export interface IDexieGroup {
  active: boolean,
  title: string,
  timers: number[],
}

interface IGroupCombined {
  igroup: IGroup,
  idexiegroup: IDexieGroup
}

const _hiddenCreateGroup: (active: boolean, id: number, timers: number[], title: string) => IGroupCombined = (active, id, timers, title) => ({
  idexiegroup: {
    active,
    timers,
    title,
  },
  igroup: {
    active,
    id,
    timers,
    title,
  }
})

const _getEmptyTimer: () => IGroupCombined = () => _hiddenCreateGroup(false, 0, [], "")

export const createEmptyDexieGroup: () => IDexieGroup = () => _getEmptyTimer().idexiegroup

export const createEmptyGroup: () => IGroup = () => _getEmptyTimer().igroup