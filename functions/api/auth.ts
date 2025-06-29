import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const auth = new Hono()

// CORS設定
auth.use(
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

// 環境変数
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const SALT_ROUNDS = 12

// ユーザー登録
auth.post('/register', async c => {
  try {
    const { email, name, password } = await c.req.json()

    // バリデーション
    if (!email || !name || !password) {
      return c.json({ error: '必須項目が不足しています' }, 400)
    }

    if (password.length < 8) {
      return c.json({ error: 'パスワードは8文字以上である必要があります' }, 400)
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: '有効なメールアドレスを入力してください' }, 400)
    }

    // 既存ユーザーチェック
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email)
      .first()

    if (existingUser) {
      return c.json({ error: 'このメールアドレスは既に登録されています' }, 409)
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // ユーザー作成
    const userId = nanoid()
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)'
    )
      .bind(userId, email, name, passwordHash)
      .run()

    // JWTトークン生成
    const token = await generateToken(userId, email, name)

    return c.json({
      success: true,
      user: { id: userId, email, name },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ユーザーログイン
auth.post('/login', async c => {
  try {
    const { email, password } = await c.req.json()

    // バリデーション
    if (!email || !password) {
      return c.json(
        { error: 'メールアドレスとパスワードを入力してください' },
        400
      )
    }

    // デモアカウントの処理
    if (email === 'demo@example.com' && password === 'DemoPass123') {
      const token = await generateToken('demo-user-id', email, 'デモユーザー')
      return c.json({
        success: true,
        user: { id: 'demo-user-id', email, name: 'デモユーザー' },
        token,
      })
    }

    // ユーザー検索
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?'
    )
      .bind(email)
      .first()

    if (!user) {
      return c.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        401
      )
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return c.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        401
      )
    }

    // JWTトークン生成
    const token = await generateToken(user.id, user.email, user.name)

    return c.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ユーザー情報取得
auth.get('/me', jwt({ secret: JWT_SECRET }), async c => {
  try {
    const payload = c.get('jwtPayload')

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, created_at FROM users WHERE id = ?'
    )
      .bind(payload.sub)
      .first()

    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404)
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
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// JWTトークン生成関数
async function generateToken(userId: string, email: string, name: string) {
  const { SignJWT } = await import('jose')
  const secret = new TextEncoder().encode(JWT_SECRET)

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

export default auth
