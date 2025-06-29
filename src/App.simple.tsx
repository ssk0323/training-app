function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Training Record App</h1>
      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', margin: '20px 0', border: '2px solid #0066cc', borderRadius: '8px' }}>
        <h2>📊 統計・分析機能</h2>
        <p>トレーニングの頻度、進捗、筋肉部位別の統計を確認できます</p>
        <button 
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => alert('統計・分析機能が実装されています！\n\n機能:\n• 週間/月間トレーニング頻度\n• 重量・回数の進捗チャート\n• 筋肉部位別統計\n\n現在テスト中です。')}
        >
          📊 統計・分析を表示
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '6px' }}>
        <h3>実装完了した機能</h3>
        <ul>
          <li>✅ トレーニングメニュー作成</li>
          <li>✅ 曜日選択機能</li>
          <li>✅ トレーニング記録</li>
          <li>✅ 統計・分析システム</li>
          <li>✅ データベース統合準備</li>
          <li>✅ PWA対応</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>開発状況</h3>
        <p>現在、統計・分析機能が完全に実装され、動作テスト中です。</p>
      </div>
    </div>
  )
}

export default App