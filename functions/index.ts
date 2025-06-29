import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { D1DatabaseAdapter } from '../src/lib/database'
import { trainingMenuService } from '../src/services/trainingMenuService'
import { trainingRecordService } from '../src/services/trainingRecordService'
import { trainingScheduleService } from '../src/services/trainingScheduleService'
import { analyticsService } from '../src/services/analyticsService'
import type {
  CreateTrainingMenuInput,
  CreateTrainingRecordInput,
} from '../src/types'
import auth from './api/auth'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'https://training-app.kenzo-sasaki-02.workers.dev',
      'https://135dc50a.training-app.pages.dev',
      'https://4805eae1.training-app.pages.dev',
    ],
    credentials: true,
  })
)

// Initialize database for services
app.use('*', async (c, next) => {
  const db = new D1DatabaseAdapter(c.env.DB)
  trainingMenuService.setDatabase(db)
  trainingRecordService.setDatabase(db)
  await next()
})

// Health check
app.get('/', c => {
  return c.json({
    message: 'Training App API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// 認証API
app.route('/api/auth', auth)

// JWT認証ミドルウェア
const authenticate = jwt({
  secret: c => c.env.JWT_SECRET || 'fallback-secret-key',
})

// Training Menu endpoints
app.get('/api/menus', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const menus = await analyticsService.getMenus(payload.sub)
    return c.json({ success: true, data: menus })
  } catch (error) {
    console.error('Get menus error:', error)
    return c.json(
      { success: false, error: 'メニューの取得に失敗しました' },
      500
    )
  }
})

app.post('/api/menus', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const input: CreateTrainingMenuInput = await c.req.json()

    // ユーザーIDを設定
    const menuWithUser = {
      ...input,
      userId: payload.sub,
    }

    const result = await analyticsService.createMenu(menuWithUser)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Create menu error:', error)
    return c.json(
      { success: false, error: 'メニューの作成に失敗しました' },
      500
    )
  }
})

app.get('/api/menus/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')
    const menu = await analyticsService.getMenuById(id, payload.sub)

    if (!menu) {
      return c.json({ success: false, error: 'メニューが見つかりません' }, 404)
    }

    return c.json({ success: true, data: menu })
  } catch (error) {
    console.error('Get menu error:', error)
    return c.json(
      { success: false, error: 'メニューの取得に失敗しました' },
      500
    )
  }
})

app.put('/api/menus/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')
    const input: CreateTrainingMenuInput = await c.req.json()

    const result = await analyticsService.updateMenu(id, input, payload.sub)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Update menu error:', error)
    return c.json(
      { success: false, error: 'メニューの更新に失敗しました' },
      500
    )
  }
})

app.delete('/api/menus/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')

    await analyticsService.deleteMenu(id, payload.sub)
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete menu error:', error)
    return c.json(
      { success: false, error: 'メニューの削除に失敗しました' },
      500
    )
  }
})

// Training Record endpoints
app.get('/api/records', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const records = await analyticsService.getRecords(payload.sub)
    return c.json({ success: true, data: records })
  } catch (error) {
    console.error('Get records error:', error)
    return c.json({ success: false, error: '記録の取得に失敗しました' }, 500)
  }
})

app.post('/api/records', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const input: CreateTrainingRecordInput = await c.req.json()

    // ユーザーIDを設定
    const recordWithUser = {
      ...input,
      userId: payload.sub,
    }

    const result = await analyticsService.createRecord(recordWithUser)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Create record error:', error)
    return c.json({ success: false, error: '記録の作成に失敗しました' }, 500)
  }
})

app.get('/api/records/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')
    const record = await analyticsService.getRecordById(id, payload.sub)

    if (!record) {
      return c.json({ success: false, error: '記録が見つかりません' }, 404)
    }

    return c.json({ success: true, data: record })
  } catch (error) {
    console.error('Get record error:', error)
    return c.json({ success: false, error: '記録の取得に失敗しました' }, 500)
  }
})

app.put('/api/records/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')
    const input: CreateTrainingRecordInput = await c.req.json()

    const result = await analyticsService.updateRecord(id, input, payload.sub)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('Update record error:', error)
    return c.json({ success: false, error: '記録の更新に失敗しました' }, 500)
  }
})

app.delete('/api/records/:id', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')

    await analyticsService.deleteRecord(id, payload.sub)
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete record error:', error)
    return c.json({ success: false, error: '記録の削除に失敗しました' }, 500)
  }
})

// Schedule endpoints
app.get('/api/schedule/today', async c => {
  try {
    const schedule = await trainingScheduleService.getTodaysSchedule()
    return c.json({ data: schedule, success: true })
  } catch (error) {
    console.error("Error fetching today's schedule:", error)
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch schedule',
        success: false,
      },
      500
    )
  }
})

// Analytics endpoints
app.get('/api/analytics', authenticate, async c => {
  try {
    const payload = c.get('jwtPayload')
    const analytics = await analyticsService.getAnalytics(payload.sub)
    return c.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Get analytics error:', error)
    return c.json(
      { success: false, error: '分析データの取得に失敗しました' },
      500
    )
  }
})

app.get('/api/analytics/frequency', async c => {
  try {
    const type = c.req.query('type') || 'weekly' // weekly or monthly
    const days = parseInt(c.req.query('days') || '90')

    const allRecords = await trainingRecordService.getAll()
    const recentRecords = analyticsService.filterRecentRecords(allRecords, days)

    let data
    if (type === 'monthly') {
      data = analyticsService.calculateMonthlyFrequency(recentRecords)
    } else {
      data = analyticsService.calculateWeeklyFrequency(recentRecords)
    }

    return c.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching frequency analytics:', error)
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch frequency analytics',
        success: false,
      },
      500
    )
  }
})

app.get('/api/analytics/progress/:menuId', async c => {
  try {
    const menuId = c.req.param('menuId')
    const days = parseInt(c.req.query('days') || '90')

    const allRecords = await trainingRecordService.getByMenuId(menuId)
    const recentRecords = analyticsService.filterRecentRecords(allRecords, days)
    const progressData = analyticsService.calculateProgress(recentRecords)

    return c.json({ data: progressData, success: true })
  } catch (error) {
    console.error('Error fetching progress analytics:', error)
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch progress analytics',
        success: false,
      },
      500
    )
  }
})

app.get('/api/analytics/muscle-groups', async c => {
  try {
    const days = parseInt(c.req.query('days') || '90')

    const allRecords = await trainingRecordService.getAll()
    const allMenus = await trainingMenuService.getAll()
    const recentRecords = analyticsService.filterRecentRecords(allRecords, days)
    const muscleGroupStats = analyticsService.calculateMuscleGroupStats(
      recentRecords,
      allMenus
    )

    return c.json({ data: muscleGroupStats, success: true })
  } catch (error) {
    console.error('Error fetching muscle group analytics:', error)
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch muscle group analytics',
        success: false,
      },
      500
    )
  }
})

// 404 handler
app.notFound(c => {
  return c.json({ success: false, error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json(
    {
      error: 'Internal Server Error',
      success: false,
    },
    500
  )
})

export default app
