// Development data seeding script
const seedData = {
  trainingMenus: [
    {
      id: 'menu-1',
      name: 'ベンチプレス',
      description: '胸筋を鍛えるメニュー',
      scheduledDays: ['monday', 'wednesday', 'friday'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'menu-2',
      name: 'スクワット',
      description: '脚を鍛えるメニュー',
      scheduledDays: ['tuesday', 'thursday'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'menu-3',
      name: 'デッドリフト',
      description: '背中を鍛えるメニュー',
      scheduledDays: ['monday', 'friday'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  trainingRecords: [
    {
      id: 'record-1',
      menuId: 'menu-1',
      date: '2024-01-15',
      comment: '調子良かった',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'record-2',
      menuId: 'menu-2',
      date: '2024-01-16',
      comment: 'きつかった',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  trainingSets: [
    // ベンチプレスのセット
    {
      id: 'set-1',
      recordId: 'record-1',
      weight: 50,
      reps: 10,
      duration: null,
      restTime: 90,
      setOrder: 1,
    },
    {
      id: 'set-2',
      recordId: 'record-1',
      weight: 50,
      reps: 8,
      duration: null,
      restTime: 90,
      setOrder: 2,
    },
    {
      id: 'set-3',
      recordId: 'record-1',
      weight: 50,
      reps: 6,
      duration: null,
      restTime: null,
      setOrder: 3,
    },
    // スクワットのセット
    {
      id: 'set-4',
      recordId: 'record-2',
      weight: 60,
      reps: 12,
      duration: null,
      restTime: 60,
      setOrder: 1,
    },
    {
      id: 'set-5',
      recordId: 'record-2',
      weight: 60,
      reps: 10,
      duration: null,
      restTime: 60,
      setOrder: 2,
    },
  ],
}

console.log('Development seed data:')
console.log(JSON.stringify(seedData, null, 2))
console.log('\nTo use this data:')
console.log('1. Create a D1 database with wrangler')
console.log('2. Run migrations to create tables')
console.log('3. Use wrangler d1 execute to insert this data')
console.log('\nExample commands:')
console.log('wrangler d1 create training-app-db')
console.log('wrangler d1 migrations apply training-app-db --local')
console.log('wrangler d1 execute training-app-db --local --command="INSERT INTO training_menus..."')