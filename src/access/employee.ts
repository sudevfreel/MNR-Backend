import type { Access } from 'payload'

export const isEmployee: Access = ({ req }) => {
  return !!req.user
}
