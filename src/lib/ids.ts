import { nanoid } from 'nanoid'

export const createId = (): string => nanoid()

export const createGameId = (): string => createId()

export const createPlayerId = (): string => createId()
