import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import type {
  Env,
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from '../types'

const auth = new Hono<{ Bindings: Env }>()

// CORS設定
auth.use(
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

// 環境変数
const SALT_ROUNDS = 12

// パスワード強度チェック
function validatePassword(password: string): {
  isValid: boolean
  error?: string
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'パスワードは8文字以上である必要があります',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードには大文字が含まれる必要があります',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードには小文字が含まれる必要があります',
    }
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'パスワードには数字が含まれる必要があります',
    }
  }

  return { isValid: true }
}

// メールアドレスの形式チェック
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// JWTトークン生成関数
async function generateToken(
  userId: string,
  email: string,
  name: string,
  env: Env
) {
  const { SignJWT } = await import('jose')
  const secret = new TextEncoder().encode(
    env.JWT_SECRET || 'fallback-secret-key'
  )

  return await new SignJWT({
    sub: userId,
    email,
    name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

// ユーザー登録
auth.post('/register', async c => {
  try {
    const { email, name, password } = await c.req.json()

    // バリデーション
    if (!email || !name || !password) {
      return c.json({ success: false, error: '必須項目が不足しています' }, 400)
    }

    if (!validateEmail(email)) {
      return c.json(
        { success: false, error: '有効なメールアドレスを入力してください' },
        400
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return c.json({ success: false, error: passwordValidation.error }, 400)
    }

    // 既存ユーザーチェック
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email)
      .first()

    if (existingUser) {
      return c.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        409
      )
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // ユーザー作成
    const userId = nanoid()
    const now = new Date().toISOString()

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(userId, email, name, passwordHash, now, now)
      .run()

    // JWTトークン生成
    const token = await generateToken(userId, email, name, c.env)

    return c.json({
      success: true,
      user: { id: userId, email, name, createdAt: now },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      500
    )
  }
})

// ユーザーログイン
auth.post('/login', async c => {
  try {
    const { email, password } = await c.req.json()

    // バリデーション
    if (!email || !password) {
      return c.json(
        {
          success: false,
          error: 'メールアドレスとパスワードを入力してください',
        },
        400
      )
    }

    // デモアカウントの処理
    if (email === 'demo@example.com' && password === 'DemoPass123') {
      const token = await generateToken(
        'demo-user-id',
        email,
        'デモユーザー',
        c.env
      )
      return c.json({
        success: true,
        user: {
          id: 'demo-user-id',
          email,
          name: 'デモユーザー',
          createdAt: new Date().toISOString(),
        },
        token,
      })
    }

    // ユーザー検索
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?'
    )
      .bind(email)
      .first()

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません',
        },
        401
      )
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return c.json(
        {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません',
        },
        401
      )
    }

    // JWTトークン生成
    const token = await generateToken(user.id, user.email, user.name, c.env)

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      500
    )
  }
})

// ユーザー情報取得
auth.get(
  '/me',
  jwt({ secret: c => c.env.JWT_SECRET || 'fallback-secret-key' }),
  async c => {
    try {
      const payload = c.get('jwtPayload')

      // デモユーザーの場合
      if (payload.sub === 'demo-user-id') {
        return c.json({
          success: true,
          user: {
            id: 'demo-user-id',
            email: 'demo@example.com',
            name: 'デモユーザー',
            createdAt: new Date().toISOString(),
          },
        })
      }

      const user = await c.env.DB.prepare(
        'SELECT id, email, name, created_at FROM users WHERE id = ?'
      )
        .bind(payload.sub)
        .first()

      if (!user) {
        return c.json(
          { success: false, error: 'ユーザーが見つかりません' },
          404
        )
      }

      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
        },
      })
    } catch (error) {
      console.error('Get user error:', error)
      return c.json(
        { success: false, error: 'サーバーエラーが発生しました' },
        500
      )
    }
  }
)

export default auth
