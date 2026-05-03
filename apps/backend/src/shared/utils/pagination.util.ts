// ==========================================================================
// Utilidad de Paginación - Helper para consultas paginadas
// ==========================================================================

import { PaginatedResult } from '../dto/pagination.dto';

export function buildPaginationMeta<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getPaginationArgs(page: number = 1, limit: number = 20) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
