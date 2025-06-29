import { Hono } from 'hono'
import { cors } from 'hono/cors'
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

// Training Menu endpoints
app.get('/api/menus', async c => {
  try {
    const menus = await trainingMenuService.getAll()
    return c.json({ data: menus, success: true })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch menus',
        success: false,
      },
      500
    )
  }
})

app.post('/api/menus', async c => {
  try {
    const input: CreateTrainingMenuInput = await c.req.json()
    const menu = await trainingMenuService.create(input)
    return c.json({ data: menu, success: true }, 201)
  } catch (error) {
    console.error('Error creating menu:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create menu',
        success: false,
      },
      400
    )
  }
})

app.get('/api/menus/:id', async c => {
  try {
    const id = c.req.param('id')
    const menu = await trainingMenuService.getById(id)

    if (!menu) {
      return c.json({ error: 'Menu not found', success: false }, 404)
    }

    return c.json({ data: menu, success: true })
  } catch (error) {
    console.error('Error fetching menu:', error)
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch menu',
        success: false,
      },
      500
    )
  }
})

// Training Record endpoints
app.get('/api/records', async c => {
  try {
    const menuId = c.req.query('menuId')

    if (menuId) {
      const records = await trainingRecordService.getByMenuId(menuId)
      return c.json({ data: records, success: true })
    } else {
      const records = await trainingRecordService.getAll()
      return c.json({ data: records, success: true })
    }
  } catch (error) {
    console.error('Error fetching records:', error)
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch records',
        success: false,
      },
      500
    )
  }
})

app.post('/api/records', async c => {
  try {
    const input: CreateTrainingRecordInput = await c.req.json()
    const record = await trainingRecordService.create(input)
    return c.json({ data: record, success: true }, 201)
  } catch (error) {
    console.error('Error creating record:', error)
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create record',
        success: false,
      },
      400
    )
  }
})

app.get('/api/records/latest/:menuId', async c => {
  try {
    const menuId = c.req.param('menuId')
    const record = await trainingRecordService.getLatestByMenuId(menuId)
    return c.json({ data: record, success: true })
  } catch (error) {
    console.error('Error fetching latest record:', error)
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch latest record',
        success: false,
      },
      500
    )
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

// 認証API
app.route('/api/auth', auth)

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found', success: false }, 404)
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
