import { format } from 'date-fns'

export const formatGameDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy LLL d, h:mma')
}
