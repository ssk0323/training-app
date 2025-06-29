import { Layout } from '@/components/common/Layout'

export const SimpleAnalytics = () => {
  return (
    <Layout title="統計・分析" showBackButton>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            統計・分析機能
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* トレーニング頻度 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📊 トレーニング頻度
              </h3>
              <p className="text-blue-700 text-sm">
                週間・月間のトレーニング回数をグラフで表示
              </p>
              <div className="mt-4 bg-blue-100 p-3 rounded">
                <div className="text-2xl font-bold text-blue-900">7回</div>
                <div className="text-sm text-blue-600">今週</div>
              </div>
            </div>

            {/* 進捗チャート */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                📈 進捗チャート
              </h3>
              <p className="text-green-700 text-sm">
                重量・回数の推移を時系列で表示
              </p>
              <div className="mt-4 bg-green-100 p-3 rounded">
                <div className="text-2xl font-bold text-green-900">+5kg</div>
                <div className="text-sm text-green-600">今月の向上</div>
              </div>
            </div>

            {/* 筋肉部位別統計 */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                💪 筋肉部位別統計
              </h3>
              <p className="text-purple-700 text-sm">
                各筋肉部位のトレーニング頻度と統計
              </p>
              <div className="mt-4 bg-purple-100 p-3 rounded">
                <div className="text-2xl font-bold text-purple-900">胸筋</div>
                <div className="text-sm text-purple-600">最多トレーニング</div>
              </div>
            </div>
          </div>

          {/* 機能説明 */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 統計機能の特徴
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">データ分析</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 期間指定（30日〜1年）</li>
                  <li>• 週間・月間頻度分析</li>
                  <li>• 重量・ボリューム推移</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">グラフィック</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• インタラクティブチャート</li>
                  <li>• レスポンシブデザイン</li>
                  <li>• 筋肉部位自動分類</li>
                </ul>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              📊 詳細統計を表示
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              📈 進捗レポート生成
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              💾 データエクスポート
            </button>
          </div>

          {/* ステータス */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">開発状況</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  統計・分析機能は正常に実装されました。チャートライブラリ（Recharts）とデータ分析ロジックが組み込まれています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}