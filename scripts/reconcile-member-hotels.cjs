// Stop API/batch writes before --apply. Default mode reports counts without writes.
// Use an explicit Hotelia URI; never infer the database from the old Nestar config.
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.HOTELIA_MIGRATION_URI;
  if (!uri) throw new Error('Set HOTELIA_MIGRATION_URI to the intended Hotelia database.');
  const apply = process.argv.includes('--apply');
  const connection = await mongoose.createConnection(uri).asPromise();
  try {
    const members = connection.collection('members');
    const hotels = connection.collection('hotels');
    let mismatches = 0;
    for await (const member of members.find({}, { projection: { _id: 1, memberHotels: 1 } })) {
      const count = await hotels.countDocuments({ ownerId: member._id, hotelStatus: { $ne: 'DELETE' } });
      if (member.memberHotels !== count) {
        mismatches++;
        if (apply) await members.updateOne({ _id: member._id }, { $set: { memberHotels: count } });
      }
    }
    console.log({ mode: apply ? 'apply' : 'dry-run', mismatches });
  } finally {
    await connection.close();
  }
}
main().catch(() => {
  console.error('Reconciliation failed. Check the URI, database connectivity and permissions.');
  process.exitCode = 1;
});
