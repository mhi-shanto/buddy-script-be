import { Types } from 'mongoose';
import { PaginatedResult } from '../types/pagination.type';

export const getSkip = (page: number, limit: number): number => (page - 1) * limit;

interface CursorParts {
  date: Date;
  id: Types.ObjectId;
}

export const encodeCursor = (doc: { createdAt: Date; _id: Types.ObjectId | string }): string =>
  Buffer.from(`${doc.createdAt.getTime()}_${doc._id.toString()}`).toString('base64url');

export const decodeCursor = (cursor?: string): CursorParts | null => {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const separatorIndex = decoded.indexOf('_');
    if (separatorIndex === -1) {
      return null;
    }

    const timestamp = Number(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);

    if (!Number.isFinite(timestamp) || !Types.ObjectId.isValid(id)) {
      return null;
    }

    return { date: new Date(timestamp), id: new Types.ObjectId(id) };
  } catch {
    return null;
  }
};

export const buildKeysetFilter = (cursor?: string): Record<string, unknown> => {
  const parts = decodeCursor(cursor);
  if (!parts) {
    return {};
  }

  return {
    $or: [
      { createdAt: { $lt: parts.date } },
      { createdAt: parts.date, _id: { $lt: parts.id } },
    ],
  };
};

export const toPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  },
});
