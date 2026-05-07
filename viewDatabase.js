const db = require('./database');

console.log('\n========================================');
console.log('📊 DIARY DATABASE VIEWER');
console.log('========================================\n');

// View all users
db.all('SELECT * FROM users', (err, users) => {
  if (err) {
    console.error('Error fetching users:', err);
    return;
  }
  
  console.log('👥 USERS TABLE:');
  console.log('----------------------------------------');
  console.table(users);
  
  // View all entries
  db.all(`
    SELECT 
      e.id,
      e.title,
      e.mood,
      e.created_at,
      u.username as author,
      LENGTH(e.content) as content_length
    FROM entries e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
  `, (err, entries) => {
    if (err) {
      console.error('Error fetching entries:', err);
      return;
    }
    
    console.log('\n📚 ENTRIES TABLE:');
    console.log('----------------------------------------');
    console.table(entries);
    
    // Statistics
    db.get('SELECT COUNT(*) as count FROM users', (err, userCount) => {
      db.get('SELECT COUNT(*) as count FROM entries', (err, entryCount) => {
        console.log('\n📈 STATISTICS:');
        console.log('----------------------------------------');
        console.log(`Total Users: ${userCount.count}`);
        console.log(`Total Entries: ${entryCount.count}`);
        console.log('========================================\n');
        
        process.exit(0);
      });
    });
  });
});
