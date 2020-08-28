export enum WrappedStatuses {
  UNWRAPPED_ETH = 'unwrappedeth',
  WRAPPED_ETH = 'wrappedeth'
}

export interface WrappedStatus {
  borderRadius: number
  siteWidth: number
  spacing: object
  topBarSize: number
  gradient: string
}

const wrappedStatus: WrappedStatus = {
  borderRadius: 12,
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72,
  gradient: 'linear-gradient(#39598A, #79D7ED)'
}

export const wrappedeth: WrappedStatus = {
  ...wrappedStatus,
  gradient: 'linear-gradient(#fedde7, #fcb4ca)'
}

export const unwrappedeth : WrappedStatus = {
  ...wrappedStatus,
  gradient: 'linear-gradient(#3e4277, #292d68)',
}

const WrappedStatusMap = { 'unwrappedeth': unwrappedeth, 'wrappedeth': wrappedeth }
export default WrappedStatusMap