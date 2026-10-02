// A deterministic in-memory model double, not a MongoDB rollback/concurrency test.
export function sessionStore() {
  const rows = new Map<string, any>();
  const matches = (row: any, filter: any) => row && Object.entries(filter).every(([key, value]: [string, any]) => {
    if (value?.$gt) return row[key] > value.$gt;
    if (value === null) return row[key] == null;
    return String(row[key]) === String(value);
  });
  const find = (filter: any) => [...rows.values()].find(row => matches(row, filter));
  const storage = {
    create: jest.fn(async data => { const row = { ...data, revokedAt: null }; rows.set(String(row._id), row); return row; }),
    findOne: jest.fn(filter => ({ lean: () => ({ exec: async () => { const row = find(filter); return row ? { ...row } : null; } }) })),
    findOneAndUpdate: jest.fn((filter, update) => ({ exec: async () => { const row = find(filter); if (!row) return null; Object.assign(row, update.$set); return { ...row }; } })),
    updateOne: jest.fn((filter, update) => ({ exec: async () => { const row = find(filter); if (row) Object.assign(row, update.$set); return { modifiedCount: row ? 1 : 0 }; } })),
  };
  return { rows, storage };
}

