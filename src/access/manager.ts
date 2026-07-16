import type { Access } from 'payload'

export const isManager: Access = ({ req }) => {
  return req.user?.role === 'manager' || req.user?.role === 'admin'
}
