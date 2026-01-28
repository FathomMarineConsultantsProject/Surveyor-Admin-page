import { apiGet, apiPatch } from "./api"

export const getFormStats = () => apiGet("/api/form/stats")

export const getFormRecords = () => apiGet("/api/form/records")

export const markReviewed = (id: number) => apiPatch(`/api/form/${id}/review`, {})

export const approveForm = (id: number) => apiPatch(`/api/form/${id}/approve`, {})
